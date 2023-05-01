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
import { borderObj, transformFlowCord } from "../utils/utils";
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
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

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

function Traffic() {
  const [showFlow, setShowFlow] = useState(false);
  const weekData = useRef({
    week02: [],
    week41: [],
    week61: [],
  });
  const [curWeek, setCurWeek] = useState("week02");
  const [timeSliderValue, setTimeSliderValue] = useState(0);
  const [maxSlideValue, setMaxSlideValue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedTime, setSelectedTime] = useState(undefined);

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
          (d) => d.time.getTime() === selectedTime.getTime()
        );
        updateWeekCircles(filteredData);
        // timeDisplay.text(selectedTime.toLocaleString());
      }
    }, 400);
  };

  const loadData = (weekFileName, immediate = true) => {
    if (weekData.current[weekFileName].length > 0) {
      console.log("week data already loaded", weekData.current);
      immediate && drawFrameGraph(timeSliderValue, curWeek);
      return;
    }
    Promise.all([d3.csv(`/src/assets/weeks/${weekFileName}.csv`)]).then(
      ([rawWeekData]) => {
        const response = rawWeekData.map((d) => {
          return {
            ...d,
            time: weekDateParser(d.time),
            x: +d.x,
            y: +d.y,
          };
        });
        weekData.current = {
          ...weekData.current,
          [weekFileName]: response,
        };
        const timeExtent = d3.extent(response, (d) => d.time);
        const timeTicks = d3.timeMinute.every(10).range(...timeExtent);
        setMaxSlideValue(timeTicks.length);
        immediate && drawFrameGraph(timeSliderValue, curWeek);
      }
    );
  };

  useEffect(() => {
    if (curWeek) {
      playTimer && clearTimeout(playTimer);
      setTimeSliderValue(0);
      // removeWeekCircles();
      setTimeout(() => {
        loadData(curWeek, playing);
      }, 0);
    }
  }, [curWeek, playing]);

  useEffect(() => {
    playing && drawFrameGraph(timeSliderValue, curWeek);
    return () => {
      if (playTimer) {
        clearTimeout(playTimer);
      }
    };
  }, [timeSliderValue, curWeek, playing]);

  const increaseProgress = () => {
    if (timeSliderValue < maxSlideValue) {
      setTimeSliderValue(timeSliderValue + Math.floor(0.1 * maxSlideValue));
    }
  };

  const declineProgress = () => {};

  useEffect(() => {
    const svg = document.getElementById(`${SVG_IDS.TRAFFIC}`);
    if (!svg) {
      drawMap();
    }
    loadData("week02", false);
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

  return (
    <>
      <Layout>
        <Sider theme="light" width={360}>
          <Space direction="vertical">
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
            <Space>
              <Button
                onClick={() => {
                  setPlaying((playing) => !playing);
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
            <span>Selected Week: </span>
            <Radio.Group
              onChange={(target) => {
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
          </Space>
        </Sider>
        <Content>
          <div style={{ height: "20px", marginLeft: "10px" }}>
            {(playing || selectedTime) && (
              <h5>Period: {weekDateFormatter(selectedTime)}</h5>
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
