export let testDate = new Date("2021-01-28T13:05:00Z");

// dates less 3 units
export let yearDate = new Date("2018-01-28T13:05:00Z");
export let quarterDate = new Date("2020-04-28T13:05:00Z");
export let monthDate = new Date("2020-10-28T13:05:00Z");
export let weekDate = new Date("2021-01-07T13:05:00Z");
export let dayDate = new Date("2021-01-25T13:05:00Z");
export let hourDate = new Date("2021-01-28T10:05:00Z");
export let minuteDate = new Date("2021-01-28T13:02:00Z");
export let secondDate = new Date("2021-01-28T13:04:57Z");
export let millisecondDate = new Date("2021-01-28T13:04:59.997Z");

export let apply3Units = Object.freeze({
  startDate: "$$this",
  amount: 3,
  timezone: "+00",
});

export let dateDiff3Units = Object.freeze({
  startDate: "$$this",
  endDate: testDate,
  timezone: "+00",
});
