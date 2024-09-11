import { useEffect, useState } from "react";
import { Alert, Spin } from "antd";
import { PopulationBarChart } from "./components/PopulationChart";
import axios from "axios";
import _ from "lodash";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [dataPopulation, setDataPopulation] = useState({});

  const getPopulation = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/getPopulation"
      );

      if (data.status === 200) {
        setDataPopulation(data.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsError(true);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPopulation();
  }, []);

  return (
    <Spin tip="Loading" size="large" spinning={isLoading}>
      {isError && <Alert message="Error" type="error" />}
      {dataPopulation.dataGraph && (
        <PopulationBarChart dataPopulation={dataPopulation} />
      )}
    </Spin>
  );
}

export default App;
