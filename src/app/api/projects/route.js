// app/api/projects/route.js
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function POST(req) {
  try {
    await client.connect();
    const database = client.db("reflowdb");
    const projects = database.collection("projects");
    const users = database.collection("users");

    const body = await req.json();
    const { name, description, devices, username } = body;

    if (!username) {
      return new Response(JSON.stringify({ error: "Username is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await projects.insertOne({
      name,
      description,
      devices,
      owner: username,
    });

    await users.updateOne(
      { username },
      { $push: { projectIDs: result.insertedId } }
    );

    return new Response(
      JSON.stringify({
        message: "Project added successfully",
        projectId: result.insertedId,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error adding project:", error);
    return new Response(JSON.stringify({ error: "Error adding project" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}

export async function GET(req) {
  try {
    await client.connect();
    const database = client.db("reflowdb");
    const projects = database.collection("projects");
    const users = database.collection("users");

    const username = req.headers.get("username");

    if (!username) {
      return new Response(JSON.stringify({ error: "Username is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the user and get their project IDs and shared access
    const user = await users.findOne({ username });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownProjectIDs = (user.projectIDs || []).map((id) => new ObjectId(id));
    const sharedProjectIDs = (user.sharedAccess || []).map(
      (id) => new ObjectId(id)
    );

    // Fetch own projects
    const ownProjects = await projects
      .find({ _id: { $in: ownProjectIDs } })
      .toArray();

    // Fetch shared projects with owner information
    const sharedProjects = await projects
      .aggregate([
        { $match: { _id: { $in: sharedProjectIDs } } },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "username",
            as: "ownerInfo",
          },
        },
        {
          $unwind: {
            path: "$ownerInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            devices: 1,
            owner: "$ownerInfo.username", // Include the owner's name
          },
        },
      ])
      .toArray();

    // Combine results
    const result = {
      ownProjects,
      sharedProjects,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new Response(JSON.stringify({ error: "Error fetching projects" }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
