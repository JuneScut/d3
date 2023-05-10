import {
  SVG_IDS,
  containerWidth,
  margin,
  containerHeight,
  width,
  height,
  viewExtent,
  opacity,
  xScale,
  yScale,
} from "../utils/constant";
import {
  borderObj,
  transformFlowCord,
  showRegionBoundaries,
  hideBoundaries,
} from "../utils/utils";
import Layout from "antd/es/layout";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import * as topojson from "topojson";
import building from "../assets/buildings.json";
import flow from "../assets/traffic/flows.json";
import Legend from "../utils/legend";
import Space from "antd/es/space";
import Switch from "antd/es/switch";
import Radio from "antd/es/radio";
import Progress from "antd/es/progress";
import Button from "antd/es/button";
import Row from "antd/es/row";
import Spin from "antd/es/spin";
import message from "antd/es/message";
import Divider from "antd/es/divider";
import Select from "antd/es/select";
import {
  MinusOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import trajectoryLegend from "../utils/trajectoryLegend";
import LocalStorageSingleton, {
  LocalStorageKeys,
} from "../utils/localStorageSingleton";
import localforage from "localforage";

const { Sider, Content } = Layout;
const geoData = topojson.feature(building, building.objects.buildings);
const projection = d3
  .geoIdentity()
  .reflectY(true)
  .fitSize([width, height], borderObj(viewExtent));
let path = d3.geoPath(projection);
const maxFlow = d3.max(flow, (d) => d.congestion_idx);
const weekDateParser = d3.timeParse("%Y-%m-%d %H:%M");
const weekDateFormatter = d3.timeFormat("%Y-%m-%d %H:%M");
const lineGenerator = d3
  .line()
  .x((d) => xScale(d[0]))
  .y((d) => yScale(d[1]));
const colorMap = {
  h: "#fe8041",
  s: "#0000c7",
  c: "#c90000",
  e: "#ff00ff",
};
const activityTypes = [
  {
    color: "#fe8041",
    text: "tohome",
  },
  {
    color: "#0000c7",
    text: "social",
  },
  {
    color: "#c90000",
    text: "commute",
  },
  {
    color: "#ff00ff",
    text: "eating",
  },
];
let playTimer;
const localStorageInstance = LocalStorageSingleton.getInstance();
localforage.setDriver(localforage.INDEXEDDB);
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function Traffic() {
  const [showFlow, setShowFlow] = useState(false);
  const weekData = useRef({
    week02: [],
    week41: [],
    week61: [],
  });
  const [curWeek, setCurWeek] = useState("");
  const [timeSliderValue, setTimeSliderValue] = useState(0);
  const [maxSlideValue, setMaxSlideValue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedTime, setSelectedTime] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [curTraj, setCurTraj] = useState("");
  const [showBoundary, setShowBoundary] = useState(false);

  const trajectories = useRef({
    commute: [],
    social: [],
    toHome: [],
  });
  const [loadingTraj, setLoadinTraj] = useState(false);

  const showFlowBubble = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    const ellipse = flow.map(transformFlowCord);

    svg
      .selectAll("ellipse")
      .data(ellipse)
      .enter()
      .append("ellipse")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("rx", (d) => {
        return (d.congestion_idx / maxFlow) * 25;
      })
      .attr("class", "flow-bubble")
      .style("fill", (d) => {
        const color_value = d.congestion_idx / maxFlow;
        const color = d3.rgb(d3.interpolateViridis(color_value));
        return (
          "rgba(" +
          color.r +
          "," +
          color.g +
          "," +
          color.b +
          "," +
          opacity +
          ")"
        );
      })
      .attr("stroke", "black")
      .attr("strokeWidth", 0.6);
  };

  const showFlowLegend = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    const legend = Legend(
      d3.scaleSequential(
        [0, d3.max(flow, (d) => d.congestion_idx)],
        d3.interpolateViridis
      ),
      {
        title: "Congestion Index [-]",
        width: 240,
      },
      "flow-legend"
    );
    svg
      .append(() => legend)
      .attr("x", 10)
      .attr("y", 650);
  };

  const hideFlowBubble = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    svg.selectAll("ellipse.flow-bubble").remove();
  };

  const hideFlowLegend = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    svg.selectAll("#flow-legend").remove();
  };

  const drawMap = () => {
    d3.select(`#${SVG_IDS.TRAFFIC}-container`)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("padding", "30px")
      .attr("id", SVG_IDS.TRAFFIC)
      .attr("viewbox", `-60 -60 ${width} ${height}`);
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", () => "white")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("class", "building");
  };

  const updateWeekCircles = (data) => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    const weekCircles = svg.selectAll(".week-circle").data(data);

    weekCircles
      .enter()
      .append("circle")
      .attr("class", "week-circle")
      .merge(weekCircles)
      .attr("cx", (d) => {
        return xScale(d.x);
      })
      .attr("cy", (d) => {
        return yScale(d.y);
      })
      .attr("r", 3)
      .attr("fill", (d) => {
        return colorMap[d.purpose] || "steelblue";
      });
    weekCircles.exit().remove();
  };

  const removeWeekCircles = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    const weekCircles = svg.selectAll(".week-circle");
    setSelectedTime(undefined);
    setTimeSliderValue(0);
    weekCircles.remove();
  };

  const drawFrameGraph = (value, curWeek) => {
    const data = weekData.current[curWeek];
    if (!data) {
      return;
    }
    const timeExtent = d3.extent(data, (d) => d.time);
    const timeTicks = d3.timeMinute.every(10).range(...timeExtent);

    playTimer = setTimeout(() => {
      if (value < timeTicks.length - 1) {
        setTimeSliderValue(value + 1);
        const selectedTime = timeTicks[value + 1];
        setSelectedTime(selectedTime);
        const filteredData = data.filter(
          (d) => d.time === selectedTime.getTime()
        );
        updateWeekCircles(filteredData);
      }
    }, 400);
  };

  const loadData = () => {
    setLoading(true);
    return new Promise((resolve) => {
      if (weekData.current[curWeek].length > 0) {
        console.log("week data already loaded", weekData.current);
        resolve(weekData.current[curWeek]);
        return;
      }
      localforage.getItem(curWeek).then((cache) => {
        if (cache) {
          console.log("week data from indexdb");
          const data = JSON.parse(cache);
          weekData.current = {
            ...weekData.current,
            [curWeek]: data,
          };
          resolve(data);
        } else {
          console.log("send request to server");
          Promise.all([
            d3.csv(
              `https://ellila-images-1253575386.cos.ap-nanjing.myqcloud.com/${curWeek}.csv`
            ),
          ]).then(([rawWeekData]) => {
            const response = rawWeekData.map((d) => {
              return {
                ...d,
                time: weekDateParser(d.time).getTime(),
                x: +d.x,
                y: +d.y,
              };
            });
            weekData.current = {
              ...weekData.current,
              [curWeek]: response,
            };
            localforage.setItem(curWeek, JSON.stringify(response)).then(() => {
              resolve(response);
            });
          });
        }
      });
    });
  };

  const increaseProgress = () => {
    if (timeSliderValue < maxSlideValue) {
      setTimeSliderValue(timeSliderValue + Math.floor(0.1 * maxSlideValue));
    }
  };

  const declineProgress = () => {
    if (timeSliderValue > 0) {
      setTimeSliderValue(
        Math.max(timeSliderValue - Math.floor(0.1 * maxSlideValue), 0)
      );
    }
  };

  const loadCommuteTrajectories = () => {
    setLoadinTraj(true);
    return new Promise((resolve) => {
      if (trajectories.current[curTraj].length > 0) {
        resolve(trajectories.current[curTraj]);
        return;
      }
      const cache = localStorageInstance.getItem(LocalStorageKeys[curTraj]);
      if (cache) {
        const data = JSON.parse(cache);
        trajectories.current[curTraj] = data;
        resolve(data);
        return;
      }
      Promise.all([
        d3.json(
          `https://ellila-images-1253575386.cos.ap-nanjing.myqcloud.com/${curTraj}Trajectories.json`
        ),
      ]).then(([rawData]) => {
        trajectories.current[curTraj] = rawData;
        localStorageInstance.setItem(
          LocalStorageKeys[curTraj],
          JSON.stringify(rawData)
        );
        resolve(rawData);
      });
    });
  };

  const showCommuteTrajectories = (data) => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    const efficiencyColorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(data, (d) => d.efficiency));

    data.forEach((trajectoryData) => {
      svg
        .append("path")
        .attr("class", "commute-trajectory")
        .datum(trajectoryData.pts)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", () => efficiencyColorScale(trajectoryData.efficiency))
        .attr("stroke-width", 0.5);
    });
  };

  const showCommuteTrajectoriesLegend = (data) => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    const efficiencyColorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(data, (d) => d.efficiency));
    trajectoryLegend(efficiencyColorScale, svg, "commute-legend", {
      legendWidth: 240,
      legendHeight: 10,
      transformX: 10,
      transformY: 720,
      title: "Efficiency",
    });
  };

  const hideCommuteTrajectories = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    svg.selectAll("path.commute-trajectory").remove();
  };

  const hideCommuteTrajectoriesLegend = () => {
    const svg = d3.select(`#${SVG_IDS.TRAFFIC}`);
    svg.selectAll(".commute-legend").remove();
  };

  useEffect(() => {
    if (curWeek) {
      playTimer && clearTimeout(playTimer);
      loadData().then((data) => {
        setLoading(false);
        const timeExtent = d3.extent(data, (d) => d.time);
        console.log({ timeExtent });
        const timeTicks = d3.timeMinute.every(10).range(...timeExtent);
        playing && drawFrameGraph(timeSliderValue, curWeek);
        setMaxSlideValue(timeTicks.length);
      });
    }
  }, [curWeek, playing]);

  useEffect(() => {
    playing && drawFrameGraph(timeSliderValue, curWeek);
    return () => {
      if (playTimer) {
        clearTimeout(playTimer);
      }
    };
  }, [timeSliderValue, playing]);

  useEffect(() => {
    const svg = document.getElementById(`${SVG_IDS.TRAFFIC}`);
    if (!svg) {
      drawMap();
    }
  }, []);

  useEffect(() => {
    if (showFlow) {
      showFlowBubble();
      showFlowLegend();
    } else {
      hideFlowBubble();
      hideFlowLegend();
    }
  }, [showFlow]);

  useEffect(() => {
    if (curTraj) {
      hideCommuteTrajectories();
      hideCommuteTrajectoriesLegend();
      loadCommuteTrajectories().then((data) => {
        setLoadinTraj(false);
        showCommuteTrajectories(data);
        showCommuteTrajectoriesLegend(data);
      });
    } else {
      hideCommuteTrajectories();
      hideCommuteTrajectoriesLegend();
    }
  }, [curTraj, trajectories.current[curTraj]]);

  useEffect(() => {
    if (showBoundary) {
      showRegionBoundaries(SVG_IDS.TRAFFIC);
    } else {
      hideBoundaries(SVG_IDS.TRAFFIC);
    }
  }, [showBoundary]);

  return (
    <>
      <Layout>
        <Sider theme="light" width={360}>
          <Space direction="vertical">
            <Space style={{ marginTop: "150px" }}>
              <span>show region boundary </span>
              <Switch
                defaultChecked={showBoundary}
                checked={showBoundary}
                onChange={() => {
                  setShowBoundary((show) => !show);
                }}
              />
            </Space>
            <div>
              <span>Show Congestion: </span>
              <Switch
                defaultChecked={showFlow}
                checked={showFlow}
                onChange={() => {
                  setShowFlow((show) => !show);
                }}
              ></Switch>
            </div>
            <Divider />
            <Space>
              <Button
                onClick={() => {
                  if (curWeek) {
                    setPlaying((playing) => !playing);
                  } else {
                    messageApi.warning("Please select a week first.");
                  }
                }}
              >
                {playing ? "PAUSE" : "PLAY"}
              </Button>
              <Button onClick={removeWeekCircles}>Remove Activities</Button>
            </Space>
            <div
              style={{
                display: "flex",
                width: "350px",
                overflow: "hidden",
              }}
            >
              <Button.Group>
                <Button onClick={declineProgress} icon={<MinusOutlined />} />
                <Button onClick={increaseProgress} icon={<PlusOutlined />} />
              </Button.Group>
              <Progress
                percent={(timeSliderValue / maxSlideValue).toFixed(5) * 100}
                style={{
                  marginLeft: "15px",
                  minWidth: "245px",
                }}
              />
            </div>
            <Row>
              {activityTypes.map((item) => {
                return (
                  <span
                    key={`activity-type-${item.color}`}
                    style={{ display: "inline-block", marginRight: "10px" }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: item.color,
                        borderRadius: "50%",
                        display: "inline-block",
                        marginRight: "6px",
                      }}
                    ></span>
                    {item.text}
                  </span>
                );
              })}
            </Row>
            <div>
              <span>Selected Week: </span>
              {loading && <Spin />}
            </div>
            <Radio.Group
              onChange={(target) => {
                setTimeSliderValue(0);
                setCurWeek(target.target.value);
              }}
              value={curWeek}
            >
              <Space direction="vertical">
                <Radio value={"week02"}>week02</Radio>
                <Radio value={"week41"}>week41</Radio>
                <Radio value={"week61"}>week61</Radio>
              </Space>
            </Radio.Group>
            <Divider />
            <div>
              <span>Show Efficency: </span>
              <Select
                allowClear
                defaultValue=""
                style={{ width: 120 }}
                onChange={(v) => {
                  setCurTraj(v);
                }}
                value={curTraj}
                options={[
                  { value: "commute", label: "commute" },
                  { value: "social", label: "social" },
                  { value: "toHome", label: "toHome" },
                ]}
              />
              {loadingTraj && (
                <Spin indicator={antIcon} style={{ marginLeft: "10px" }} />
              )}
            </div>
          </Space>
        </Sider>
        <Content>
          {contextHolder}
          <div
            style={{
              height: "30px",
              marginLeft: "10px",
              marginTop: "10px",
              fontSize: "1.8em",
              fontWeight: "bold",
            }}
          >
            {(playing || selectedTime) && (
              <span>Period: {weekDateFormatter(selectedTime)}</span>
            )}
          </div>
          <div
            id={`${SVG_IDS.TRAFFIC}-container`}
            style={{
              width: containerWidth + margin.left + margin.right,
              height: containerHeight + margin.top + margin.bottm,
              overflow: "hidden",
            }}
          />
        </Content>
      </Layout>
    </>
  );
}

export default Traffic;
