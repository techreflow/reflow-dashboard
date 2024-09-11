import { useState, useEffect } from "react";

const DeviceConfig = ({ closeFunction, deviceDetails }) => {
  const [deviceInput, setDeviceInput] = useState({
    MIN1: "",
    MAX1: "",
    FAC1: "",
    CAL1: "",
    SNO1: "",
    MIN2: "",
    MAX2: "",
    FAC2: "",
    CAL2: "",
    SNO2: "",
    MIN3: "",
    MAX3: "",
    FAC3: "",
    CAL3: "",
    SNO3: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch(
          `/api/mqtt-output?serialId=${deviceDetails.id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Assuming data is an array with a single object as shown in your example
        if (data.length > 0) {
          const fetchedData = data[0];
          setDeviceInput({
            MIN1: fetchedData.MIN1,
            MAX1: fetchedData.MAX1,
            FAC1: fetchedData.FAC1,
            CAL1: fetchedData.CAL1,
            SNO1: fetchedData.SNO1,
            MIN2: fetchedData.MIN2,
            MAX2: fetchedData.MAX2,
            FAC2: fetchedData.FAC2,
            CAL2: fetchedData.CAL2,
            SNO2: fetchedData.SNO2,
            MIN3: fetchedData.MIN3,
            MAX3: fetchedData.MAX3,
            FAC3: fetchedData.FAC3,
            CAL3: fetchedData.CAL3,
            SNO3: fetchedData.SNO3,
          });
        }
      } catch (error) {
        console.error("Error fetching device data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchDeviceData();
  }, [deviceDetails.id]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setDeviceInput((prevState) => ({
      ...prevState,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const deviceData = [
    {
      type: "header",
      name: { name: "serial number", value: "Serial No." },
      range: {
        name: "Range",
        value: [
          { name: "min", value: "Min" },
          { name: "max", value: "Max" },
        ],
      },
      calibration: { name: "cal", value: "Calibration" },
      factor: { name: "fac", value: "Factor" },
      alert: {
        name: "Threshold",
        value: [
          { name: "min", value: "Min" },
          { name: "max", value: "Max" },
        ],
      },
      readings: { name: "read", value: "Readings" },
      calibratedReadings: { name: "cal_read", value: "Calibrated Readings" },
    },
    {
      name: { name: "SNO1", value: deviceInput.SNO1 },
      range: {
        value: [
          { name: "MIN1", value: deviceInput.MIN1 },
          { name: "MAX1", value: deviceInput.MAX1 },
        ],
      },
      calibration: { name: "CAL1", value: deviceInput.CAL1 },
      factor: { name: "FAC1", value: deviceInput.FAC1 },
      alert: {
        value: [
          { name: "min", value: "" },
          { name: "max", value: "" },
        ],
      },
      readings: { name: "", value: "" },
      calibratedReadings: { name: "", value: "" },
    },
    {
      name: { name: "SNO2", value: deviceInput.SNO2 },
      range: {
        value: [
          { name: "MIN2", value: deviceInput.MIN2 },
          { name: "MAX2", value: deviceInput.MAX2 },
        ],
      },
      calibration: { name: "CAL2", value: deviceInput.CAL2 },
      factor: { name: "FAC2", value: deviceInput.FAC2 },
      alert: {
        value: [
          { name: "min", value: "" },
          { name: "max", value: "" },
        ],
      },
      readings: { name: "", value: "" },
      calibratedReadings: { name: "", value: "" },
    },
    {
      name: { name: "SNO3", value: deviceInput.SNO3 },
      range: {
        value: [
          { name: "MIN3", value: deviceInput.MIN3 },
          { name: "MAX3", value: deviceInput.MAX3 },
        ],
      },
      calibration: { name: "CAL3", value: deviceInput.CAL3 },
      factor: { name: "FAC3", value: deviceInput.FAC3 },
      alert: {
        value: [
          { name: "min", value: "" },
          { name: "max", value: "" },
        ],
      },
      readings: { name: "", value: "" },
      calibratedReadings: { name: "", value: "" },
    },
  ];

  const displayFactorValue = (value) => {
    switch (value) {
      case 0:
        return "Addition";
      case 1:
        return "Subtraction";
      case 2:
        return "Multiplication";
      case 3:
        return "Division";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deviceInput.CAL1 < 0 || deviceInput.CAL2 < 0 || deviceInput.CAL3 < 0) {
      alert("Calibration value cannot be negative");
    } else {
      try {
        const topic = generateMqttTopic(deviceDetails.id); // Generate the topic using device id
        const response = await fetch("/api/mqtt-input", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deviceInput, topic }), // Send both deviceInput and the topic
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Data published successfully:", result);
        alert("Data published successfully");
      } catch (error) {
        console.error("Error publishing data:", error);
        alert("Failed to publish data");
      }
    }
  };

  const generateMqttTopic = (serialId) => {
    const prefix = serialId.slice(0, 3); // AX3
    const suffix = serialId.slice(3); // 03
    return `${prefix}/${suffix}/IN`; // AX3/03/IN
  };

  const tableCellStyle = "py-5 px-2 border-r border-b text-center";
  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 pb-10">
            <div className="text-3xl font-bold text-[#1D1D1D]">
              Welcome to{" "}
              {JSON.parse(sessionStorage.getItem("selectedProjectID")).name}
            </div>
            <div className="text-lg font-semibold flex gap-8 pl-1 text-theme_black/40">
              <span>Device - {deviceDetails && deviceDetails.name}</span>
              <span>S.NO. - {deviceDetails && deviceDetails.id}</span>
            </div>
          </div>
          <div className="bg-theme_black/10 p-6 rounded-xl flex flex-col gap-8">
            <div className="flex flex-col">
              {deviceData.map((device, index) => (
                <form
                  key={index}
                  className={`grid grid-cols-7 font-medium ${
                    device.type
                      ? "bg-theme_black text-theme_white rounded-t-xl"
                      : "text-theme_black bg-theme_white"
                  } `}
                >
                  <div
                    className={`${tableCellStyle} border-l ${
                      device.type && "rounded-tl-xl"
                    } ${device.type ? "" : "border-theme_black"}`}
                  >
                    <input
                      type="text"
                      name={device.name.name}
                      value={device.name.value}
                      onChange={handleInputChange}
                      className={`text-center w-11/12 ${
                        device.type && "bg-theme_black text-lg text-theme_white"
                      }`}
                      disabled={device.type}
                    />
                  </div>
                  <div className="grid grid-cols-2">
                    <div
                      className={`${tableCellStyle} col-span-2 ${
                        device.range.name ? "" : "hidden"
                      }`}
                    >
                      {device.range.name}
                    </div>
                    {device.range.value.map((data, index) => (
                      <div
                        className={`${tableCellStyle} ${
                          device.type ? "" : "border-theme_black"
                        }`}
                        key={index}
                      >
                        <input
                          type={device.type ? "text" : "number"}
                          name={data.name}
                          value={data.value}
                          onChange={handleInputChange}
                          className={`text-center w-11/12 ${
                            device.type &&
                            "bg-theme_black text-lg text-theme_white"
                          }`}
                          disabled={device.type}
                        />
                      </div>
                    ))}
                  </div>
                  <div
                    className={`${tableCellStyle} ${
                      device.type ? "" : "border-theme_black"
                    }`}
                  >
                    <input
                      type={device.type ? "text" : "number"}
                      name={device.calibration.name}
                      value={device.calibration.value}
                      onChange={handleInputChange}
                      className={`text-center w-11/12 ${
                        device.type && "bg-theme_black text-lg text-theme_white"
                      }`}
                      disabled={device.type}
                    />
                  </div>
                  <div
                    className={`${tableCellStyle} ${
                      device.type ? "" : "border-theme_black"
                    }`}
                  >
                    {device.type ? (
                      device.factor.value
                    ) : (
                      <select
                        name={device.factor.name}
                        value={device.factor.value}
                        onChange={handleInputChange}
                        className="-ml-1 bg-theme_black/10 py-2 px-2 rounded-full"
                      >
                        <option disabled>
                          {displayFactorValue(device.factor.value)}
                        </option>
                        <option value={0}>Addition</option>
                        <option value={1}>Subtraction</option>
                        <option value={2}>Multiplication</option>
                        <option value={3}>Division</option>
                      </select>
                    )}
                  </div>
                  <div
                    className={`grid grid-cols-${device.alert.value.length}`}
                  >
                    <div
                      className={`${tableCellStyle} col-span-2 ${
                        device.alert.name ? "" : "hidden"
                      }`}
                    >
                      {device.alert.name}
                    </div>
                    {device.alert.value.map((data, index) => (
                      <div
                        className={`${tableCellStyle} ${
                          device.type ? "" : "border-theme_black"
                        }`}
                        key={index}
                      >
                        {data.value}
                      </div>
                    ))}
                  </div>
                  <div
                    className={`${tableCellStyle} ${
                      device.type ? "" : "border-theme_black"
                    }`}
                  >
                    {device.readings.value}
                  </div>
                  <div
                    className={`${tableCellStyle} ${
                      device.type && "rounded-t-xl"
                    } ${device.type ? "" : "border-theme_black"}`}
                  >
                    {device.calibratedReadings.value}
                  </div>
                </form>
              ))}
            </div>
            <div className="flex justify-end gap-6">
              <button
                className={`bg-theme_black text-theme_white text-center w-36 py-3 rounded-full text-lg border border-theme_black`}
                onClick={handleSubmit}
              >
                Save
              </button>
              <button
                className="bg-theme_black/40 text-theme_white border border-theme_black/30 text-center w-36 py-3 rounded-full text-lg"
                onClick={closeFunction}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeviceConfig;
