/* 
  - 休日 : 固定日、可変の春・秋分、何周目の何曜日、振替休日、旧暦、六曜。
          年の和名
          臨時制定休日は設定情報で補う。
  TODO
    design.
*/
import { lunarsolarDates } from "./lunarsolar.js"
import { NameOfYear } from "./nameofyear.js"
import { SPRING_EQUINOX, AUTUMN_EQUINOX, DAYS_OF_MONTH, SUMDAYS_OF_MONTHS, WEEKDAY_STR, JAPAN_WEEKDAY_STR } from "./calendarInfo.js"
import { HOLIDAY_INFO, TRANSFER_HOLIDAY } from "./holidayInfo.js"
import { HOLIDAY_DESCS } from "./holidayDesc.js"

const TABLE_TD_WIDTH = '108px';
const CL_OPTION_TRUE = '#222';
const CL_OPTION_FALSE = '#eee';
const CLBK_OPTION_TRUE = '#fedeb8';
const CLBK_OPTION_FALSE = '#9B846A';

var isViewJapanWeek = true;
var isViewLunarCalendar = true;
var CURRENT_YMD = 0;

/* useYearの年はその休日が適用されてる年を入力すること */
/* 不正期休日,休日に挟まれた平日を休日にする */

var TODAY = new Date();
var TODAY_INFO = {
      ymd: TODAY.getFullYear() * 10000 + (TODAY.getMonth() + 1) * 100 + TODAY.getDate(),
      y: TODAY.getFullYear(),
      m: TODAY.getMonth() + 1,
      d: TODAY.getDate(),
      weeknum: TODAY.getDay(),
}

/**
 * 閏年か, 0:平年, 1:閏年
 * @param yyyy 年
 * @returns 1 | 0
 */
function isLeapYear(yyyy) {
  if (yyyy % 400 == 0) return 1;
  if (yyyy % 100 == 0) return 0;
  if (yyyy % 4 == 0) return 1;
  return 0;
}

/**
 * 指定年月の初日の曜日(0:日,6:土) 
 * @param yyyymm 年月
 * @returns 曜日の数字
 */
function getWeekFirstDayOfMonth(yyyymm) {
  let d = new Date(Math.floor(yyyymm/100), yyyymm % 100 - 1, 1);
  return d.getDay();
}

/**
 * 指定年月の最終日の曜日(0:日,6:土)
 * @param yyyymm 年月
 * @returns 曜日の数字
 */
function getWeekLatestDayOfMonth(yyyymm) {
  let mm = yyyymm % 100;
  let d = new Date(Math.floor(yyyymm/100), mm - 1, DAYS_OF_MONTH[mm - 1] + isLeapYear(Math.floor(yyyymm / 100)));
  return d.getDay();
}

/**
 * 月前の累積日数を算出する
 * @param yyyymm 年月
 * @returns 月前の累積日数
 */
function getDaysOfMonth(yyyymm) {
  return DAYS_OF_MONTH[yyyymm % 100 - 1] + (yyyymm % 100 == 2 ? isLeapYear(Math.floor(yyyymm / 100)):0);
}

/**
 * yyyymmddからyyyyを返す
 * @param {*} yyyymmdd 
 */
function getYear(yyyymmdd) {
  return Math.floor(Number(yyyymmdd) / 10000);
}

/**
 * yyyymmddからmmを返す
 * @param {*} yyyymmdd 
 */
function getMonth(yyyymmdd) {
  return Math.floor(Number(yyyymmdd) / 100) % 100;
}

/**
 * yyyymmddからmmを返す
 * @param {*} yyyymmdd 
 */
function getDay(yyyymmdd) {
  return Math.floor(Number(yyyymmdd) % 100);
}

/**
 * 指定の月の休日を算出
 * @param yyyymm
 * @returns セットしたデータ: {year: number, days: [{mmdd:number, name: string}]}
 */
function getHolidays(yyyy) {
  let result = [];

  let loop0 = HOLIDAY_INFO.length;
  for (let x=0; x<loop0; x++) {
    let item = HOLIDAY_INFO[x];
    if (item.fixed?.length) {
      for (let i=0; i < item.fixed.length; i++) {
      }
    }
    if (item.fixedType?.length) {
      let loop1 = item.fixedType.length;
      for (let i=0; i < loop1; i++) {
        if (item.fixedType[i]?.useYears?.length) {
          let useYears = item.fixedType[i].useYears;
          let loop2 = useYears.length;
          for (let j=0; j < loop2; j++) {
            if(yyyy >= useYears[j].start && yyyy <= useYears[j].end) {
              result.push({dd: yyyy*10000 + item.month*100 + item.fixedType[i].day, name: useYears[j].name})
            }
          }
        }
      }
    }
    if (item.irregular?.length) {
      let loop3 = item.irregular?.length;
      for (let i=0; i < loop3; i++)  {
        let irregular = item.irregular[i];
        if (irregular.useYears?.length) {
          let loop4 = irregular.useYears?.length;
          for (let j=0; j < loop4; j++)  {
            let useYear = irregular.useYears[j];
            if (useYear.start <= yyyy && useYear.end >= yyyy) {
              switch(irregular.type) {
                case 'springEquinox':
                  {
                    let loop5 = SPRING_EQUINOX.length;
                    for (let k=0; k<loop5; k++) {
                      if (SPRING_EQUINOX[k].start <= yyyy && SPRING_EQUINOX[k].end >= yyyy) {
                        result.push({dd: yyyy*10000 + item.month*100 + SPRING_EQUINOX[k].remain[yyyy % 4],
                          name: irregular.name})
                        break;
                      }
                    }
                  }
                  break;
                case 'autumnEquinox':
                  {
                    let loop5 = AUTUMN_EQUINOX.length;
                    for (let k=0; k<loop5; k++) {
                      if (AUTUMN_EQUINOX[k].start <= yyyy && AUTUMN_EQUINOX[k].end >= yyyy) {
                        result.push({dd: yyyy*10000 + item.month*100 + AUTUMN_EQUINOX[k].remain[yyyy % 4],
                          name: irregular.name})
                        break;
                      }
                    }
                  }
                  break;
                case 'weekly':
                  { 
                    let nThDate = 0;
                    let tmpDate = new Date(yyyy, item.month - 1, 1);
                    let firstDayWeekNum = tmpDate.getDay();
                    if (irregular.weekly.week < firstDayWeekNum) {
                      let temp = (1 + 7 - (firstDayWeekNum - irregular.weekly.week));
                      nThDate = temp + (irregular.weekly.th -1) * 7;
                    } else if (irregular.weekly.week == firstDayWeekNum) {
                      let temp = 1;
                      nThDate = temp + (irregular.weekly.th -1) * 7;
                    } else if (irregular.weekly.week > firstDayWeekNum) {
                      let temp = 1 + (irregular.weekly.week - firstDayWeekNum);
                      nThDate = temp + (irregular.weekly.th -1) * 7;
                    }
                    result.push({dd: yyyy*10000 + item.month*100 + nThDate,
                          name: irregular.name})
                  }
                  break;
              }
            }
          }
        }
      }
    }
  }
  return result;
}

/**
 * 日の情報を集める
 * @param yyyymmdd 年月日
 * @returns その日の情報を算出した情報
 */
function getDayInfo(yyyymmdd, holidays, isDispMonth) {
  let now = new Date();
  let di = {
    yyyymmdd,
    y: Math.floor(yyyymmdd / 10000),
    m: Math.floor((yyyymmdd % 10000) / 100),
    d: (yyyymmdd % 100),
  }
  let d = new Date(di.y, di.m - 1, di.d);
  di.weekNum = d.getDay();
  di.daysOfYear = SUMDAYS_OF_MONTHS[di.m - 1] + di.d + (di.m > 2 ? isLeapYear(di.yyyy):0);
  di.isThisYear = di.y == now.getFullYear();
  di.isThisMonth = (di.m - 1) == now.getMonth();
  di.isToday = di.isThisYear && di.isThisMonth && di.d == now.getDate();
  di.isDispMonth = isDispMonth;
  let result = holidays.find(v => v.dd === yyyymmdd);
  di.isHoliday = !!result;
  di.holidayName = di.isHoliday? result.name: '';
  /* 旧暦 */
  const lunarDate = (lunarsolarDates.find((v) => v.solar === yyyymmdd));
  if (lunarDate) {
    di.lunar = lunarDate.lunar;
    di.lunarleap = lunarDate.leap;
  }
  /* 六曜 */
  switch(Math.floor(di.lunar / 100) % 100) {
    case 1: case 7:
      di.japanweek = ((di.lunar - 1) % 100) % 6; break;
    case 2: case 8:
      di.japanweek = ((di.lunar - 0) % 100) % 6; break;
    case 3: case 9:
      di.japanweek = ((di.lunar + 1) % 100) % 6; break;
    case 4: case 10:
      di.japanweek = ((di.lunar + 2) % 100) % 6; break;
    case 5: case 11:
      di.japanweek = ((di.lunar + 3) % 100) % 6; break;
    case 6: case 12:
      di.japanweek = ((di.lunar + 4) % 100) % 6; break;
    default:
      di.japanweek = 0;
  }

  return di;
}

/**
 * 指定の月の日々の情報をセットする
 * @param yyyymm 年月
 * @returns セットできた日々の情報の配列
 */
function makeCalendarMonth(yyyymm, isDispMonth) {
  let days = [];
  let daysOfMonth = getDaysOfMonth(yyyymm);
  let holidays = getHolidays(Math.floor(yyyymm / 100));
  /** */
  // if(isDispMonth) console.info('info:holidays:',holidays.length, holidays);
  for (let i = 1; i <= daysOfMonth; i++) {
    days.push(getDayInfo(yyyymm * 100 + i, holidays, isDispMonth));
  }

  /* 振替休日 */
  if (TRANSFER_HOLIDAY.find(v => v.start <= days[0].y && v.end >= days[0].y)) {
    for (let i = 1; i <= daysOfMonth; i++) {
      if (days[i]?.isHoliday && days[i].weekNum == 0) {
        for (let j = 1; j < 6; j++) {
          if (!days[i+j].isHoliday) {
            days[i+j].isHoliday = true;
            days[i+j].holidayName = '振替休日';
            break;
          }
        }
      }
    }
  }

  return days;
}

/**
 * 数字の年月日をObjectに変換する。
 * @param yyyymmdd 年月日
 * @returns Date object
 */
function getDateObj(yyyymmdd) {
  let obj = convertDate(yyyymmdd);
  return new Date(obj.y, obj.m - 1, obj.d);
}

/**
 * 数字の年月日を使用しやすく分んかつしてJSONにする。
 * @param yyyymmdd 年月日
 * @returns 変換した日にちのJSON 
 */
function convertDate(yyyymmdd) {
  return {
    ymd: yyyymmdd,
    y: Math.floor(yyyymmdd / 10000),
    m: Math.floor((yyyymmdd / 100) % 100),
    d: yyyymmdd % 100,
  };
}

function setCalendar(yyyymmdd) {
  let currMonthDays = makeCalendarMonth(Math.floor(yyyymmdd / 100), true);
  let argDateObj = getDateObj(yyyymmdd);
  argDateObj.setMonth(argDateObj.getMonth() - 1);
  let prevMonthDays = makeCalendarMonth(argDateObj.getFullYear() * 100 + (argDateObj.getMonth() + 1), false);
  argDateObj.setMonth(argDateObj.getMonth() + 2);
  let nextMonthDays = makeCalendarMonth(argDateObj.getFullYear() * 100 + (argDateObj.getMonth() + 1), false);

  let currentCalendar = []
  for (let i=prevMonthDays.length - currMonthDays[0].weekNum; i < prevMonthDays.length; i++ ) {
    currentCalendar.push(prevMonthDays[i])
  }
  currentCalendar = [...currentCalendar,...currMonthDays];

  let addNextMonthDays = nextMonthDays.slice(0, 42 - currentCalendar.length);
  currentCalendar = [...currentCalendar,...addNextMonthDays];
  /** */
  // console.info('info:setCalendar:currentCarlendar', currentCalendar);

  return currentCalendar;
}

function setNode(cell, value, classNames, tag) {
  let node;
  if (tag)
    node = document.createElement(tag);
  else
    node = document.createElement('p');
  classNames.forEach(val => {
    node.classList.add(val);
  })
  node.textContent = value;
  cell.appendChild(node);
}

function setDayInfo(cell, dayInfo) {
  /* 日にち */
  let classNames = ['day'];
  if (dayInfo.weekNum == 0 && dayInfo.isDispMonth) classNames.push('sunday');
  if (dayInfo.weekNum == 6 && dayInfo.isDispMonth) classNames.push('saturday');
  if (dayInfo.isHoliday) {
    classNames.push('isHoliday');
  }
  setNode(cell, dayInfo.d, classNames);

  /* 旧暦の日にち */
  if (isViewLunarCalendar) {
    let lunarDate = '(';

    let lunarM = getMonth(dayInfo.lunar);
    let lunarD = getDay(dayInfo.lunar);
    
    if (dayInfo.lunarleap) lunarDate += '*';
    if (lunarD == 1 || dayInfo.d == 1) lunarDate += lunarM + ".";
    lunarDate += lunarD + ")";

    classNames = ['lunar'];
    setNode(cell, lunarDate, classNames);
  }

  setNode(cell, "", ['dummy']);
  setNode(cell, "", ['dummy']);

  /* 六曜 */
  if (isViewJapanWeek) {
    classNames = ['japanWeek'];
    if (dayInfo.japanweek == 4) classNames.push('taian');
      setNode(cell, JAPAN_WEEKDAY_STR[[dayInfo.japanweek]], classNames);
  }

  /* 休日名 */
  setNode(cell, dayInfo.isHoliday?dayInfo.holidayName:'', ['holidayName', 'isHoliday']);

  /* 今日なのか */
  if (dayInfo.isToday) {
    cell.classList.add('isToday');
  }

  /* 先月の最終、今月、来月の最初の中て今月の場合 */
  if (!dayInfo.isDispMonth){
    cell.classList.add('otherMonth');
  }
}

function setElement(currentMonthDays) {
  const tbody = document.createElement('tbody');
  tbody.classList.add('cal_tbody');

  // 曜日名を設定
  let trHeader = document.createElement('tr');
  trHeader.classList.add('cal_tr');
  for (let i=0; i < 7; i++) {
    var cell = document.createElement('th');
    // cell.style.width = TABLE_TD_WIDTH;
    cell.classList.add('cal_th');
    if (i == 0) cell.classList.add('th_sunday');
    if (i == 6) cell.classList.add('th_saturday');
    var cellText = document.createTextNode(WEEKDAY_STR[i]);
    cell.appendChild(cellText);
    trHeader.appendChild(cell);
  }
  tbody.appendChild(trHeader);

  // 日々を設定
  const loopcnt = currentMonthDays.length;
  for (let i = 0; i < loopcnt; i++) {
    var row;
    if (i % 7 == 0) {
      row = document.createElement('tr');
      row.classList.add('cal_tr');
    } 
    var cell = document.createElement('td');
    // cell.style.width=TABLE_TD_WIDTH;
    cell.classList.add('cal_td');

    var dayInfo = currentMonthDays[i];
    setDayInfo(cell, dayInfo);

    row.appendChild(cell);

    if ((i+1)%7 == 0) {
      tbody.appendChild(row);
    }
  }
  return tbody;
}

function getDateYMD(date) {
  let curr = new Date();
  if (date instanceof Date) curr = date;
  return curr.getFullYear() * 10000 + (curr.getMonth() + 1) * 100 + curr.getDate();
}

function setDisplayYM(yyyymmdd) {
  let nodeDispY = document.getElementById('displayYear');
  let nodeDispM = document.getElementById('displayMonth');

  nodeDispY.textContent = '' + Math.floor(yyyymmdd / 10000);
  nodeDispM.textContent = '' + (Math.floor(yyyymmdd / 100) % 100);

  setDisplayNameOfYear(yyyymmdd);
}


document.getElementById("prevYear").addEventListener('click', prevYear, false);
document.getElementById("prevMonth").addEventListener('click', prevMonth, false);
document.getElementById("nextMonth").addEventListener('click', nextMonth, false);
document.getElementById("nextYear").addEventListener('click', nextYear, false);
document.getElementById("returnThisMonth").addEventListener('click', returnThisMonth, false);
document.getElementById("japanWeek").addEventListener('click', viewJapanWeek, false);
document.getElementById("lunarCalendar").addEventListener('click', viewLunarCalendar, false);

/* style.cssの”.moveMonth” */
const settings = {
  buttonStyle: {
    clickable: {
      bgcolor: '#fedeb8',
      color: '#222',
    },
    unclickable: {
      bgcolor: '#fedeb8',
      color: '#c0a381',
    }
  }
}
async function displayCalendar(yyyymmdd) {
  /**
   * 今月ボタン
   */
  CURRENT_YMD = yyyymmdd;
  let retThisMon = document.getElementById('returnThisMonth');
  if (Math.floor(yyyymmdd / 10000) == TODAY.getFullYear()
    && Math.floor(yyyymmdd / 100) % 100 == (TODAY.getMonth() +1))
  {
    retThisMon.style.background_color = settings.buttonStyle.unclickable.bgcolor;
    retThisMon.style.color = settings.buttonStyle.unclickable.color;
    retThisMon.disabled = true;
    // retThisMon.style.display = "none";
  } else {
    retThisMon.style.background_color = settings.buttonStyle.clickable.bgcolor;
    retThisMon.style.color = settings.buttonStyle.clickable.color;
    retThisMon.disabled = false;
    // retThisMon.style.display = "block";
  }

  var monthDays = document.getElementById('monthDays');
  var node = document.getElementById('cal_table');
  if (node) monthDays.removeChild(node);

  const table = document.createElement('table');
  table.style.width = '100%';
  table.classList.add('cal_table');
  table.setAttribute('id', 'cal_table');
  // table.style.tableLayout = 'fixed';

  const currentCalendar = setCalendar(yyyymmdd);
  // console.log('debug:displayCalendar:', currentCalendar);

  const tblBody = setElement(currentCalendar);

  table.appendChild(tblBody);

  monthDays.appendChild(table);

  /* 休日説明 */
  const nameofYear = document.getElementById('nameOfYear').textContent;
  const dispHolidays = currentCalendar.filter((value) => value.isDispMonth && value.isHoliday);
  const dispHolidaysInfo = HOLIDAY_DESCS.filter((value) =>
    dispHolidays.find(value2 => {
      return (value2.holidayName === value.key &&
      (value.subKey? nameofYear.indexOf(value.subKey) >= 0: true))
    })
  );
  
  const holidayElement = document.getElementById('holidays');
  const delNode = document.getElementById('holidayList');
  if (delNode) holidayElement.removeChild(delNode);

  let holidayList = document.createElement('div');
  holidayList.setAttribute('id', 'holidayList');
  dispHolidaysInfo.forEach((value) => {
    let node1 = document.createElement('div');
    let di = currentCalendar.find((value2) => value2.holidayName === value.key);
    setNode(node1, di.d + ' - ' + value.key, ["h_date"]);
    setNode(node1, value.desc, ["h_text"]);

    let ho1node = document.createElement('a');
    ho1node.setAttribute('href', value.link);
    ho1node.setAttribute('target', "_blank");
    ho1node.classList.add("h_link");
    ho1node.classList.add("h_text");
    ho1node.textContent = "詳細";
    node1.appendChild(ho1node);

    holidayList.appendChild(node1);
  })
  holidayElement.appendChild(holidayList);
}

window.onload = function() {
  //for ready, test
  const yyyymmdd = getDateYMD();
  //const holidays = getHolidays(Math.floor(yyyymmdd / 10000));

  setDisplayYM(yyyymmdd);
  displayCalendar(yyyymmdd);
}

function setDisplayNameOfYear(yyyymmdd) {
  let nodeNameOfYear = document.getElementById('nameOfYear');
  let yy = Math.floor(yyyymmdd / 10000);
  let yymm = Math.floor(yyyymmdd / 100);

  let nameOfYear = NameOfYear.find(val => {
    return (Math.floor(val.start / 100) <= yymm && Math.floor(val.end / 100));
  })

  if (!!nameOfYear) {
    let jpYear = yy - Math.floor(nameOfYear.start / 10000) + 1;
    nodeNameOfYear.textContent = nameOfYear.name + (jpYear == 1 ? " 元年": `  ${jpYear}年`)
  } else {
    nodeNameOfYear.textContent = "";
  }
}

function prevYear() {
  let nodeDispY = document.getElementById('displayYear');
  let nodeDispM = document.getElementById('displayMonth');
  let yyyy = nodeDispY.textContent;
  let mm = nodeDispM.textContent;

  let dt = new Date(yyyy, mm - 1, 1);
  dt.setMonth(dt.getMonth() - 12);
  let yyyymmdd = getDateYMD(dt)

  displayCalendar(yyyymmdd);

  setDisplayYM(yyyymmdd);
}

function prevMonth() {
  let nodeDispY = document.getElementById('displayYear');
  let nodeDispM = document.getElementById('displayMonth');
  let yyyy = nodeDispY.textContent;
  let mm = nodeDispM.textContent;

  let dt = new Date(yyyy, mm - 1, 1);
  dt.setMonth(dt.getMonth() - 1);
  let yyyymmdd = getDateYMD(dt)

  displayCalendar(yyyymmdd);

  setDisplayYM(yyyymmdd);
}

function nextMonth() {
  let nodeDispY = document.getElementById('displayYear');
  let nodeDispM = document.getElementById('displayMonth');
  let yyyy = nodeDispY.textContent;
  let mm = nodeDispM.textContent;

  let dt = new Date(yyyy, mm - 1, 1);
  dt.setMonth(dt.getMonth() + 1);
  let yyyymmdd = getDateYMD(dt)

  displayCalendar(yyyymmdd);

  setDisplayYM(yyyymmdd);
}

function nextYear() {
  let nodeDispY = document.getElementById('displayYear');
  let nodeDispM = document.getElementById('displayMonth');
  let yyyy = nodeDispY.textContent;
  let mm = nodeDispM.textContent;

  let dt = new Date(yyyy, mm - 1, 1);
  dt.setMonth(dt.getMonth() + 12);
  let yyyymmdd = getDateYMD(dt)

  displayCalendar(yyyymmdd);

  setDisplayYM(yyyymmdd);
}

function returnThisMonth() {

  let yyyymmdd = getDateYMD(TODAY);

  displayCalendar(yyyymmdd);

  setDisplayYM(yyyymmdd);
}

function viewJapanWeek() {
  var node = document.getElementById('japanWeek');
  var curClor = node.style.color;
  var curBkClor = node.style.backgroundColor;
  if (isViewJapanWeek) {
    isViewJapanWeek = false;
    node.style.color = CL_OPTION_FALSE;
    node.style.backgroundColor = CLBK_OPTION_FALSE;
  } else {
    isViewJapanWeek = true;
    node.style.color = CL_OPTION_TRUE;
    node.style.backgroundColor = CLBK_OPTION_TRUE;
  }

  displayCalendar(CURRENT_YMD);
  setDisplayYM(CURRENT_YMD);
}

function viewLunarCalendar() {
  var node = document.getElementById('lunarCalendar');
  if (isViewLunarCalendar) {
    isViewLunarCalendar = false;
    node.style.color = CL_OPTION_FALSE;
    node.style.backgroundColor = CLBK_OPTION_FALSE;
  } else {
    isViewLunarCalendar = true;
    node.style.color = CL_OPTION_TRUE;
    node.style.backgroundColor = CLBK_OPTION_TRUE;
  }

  displayCalendar(CURRENT_YMD);
  setDisplayYM(CURRENT_YMD);
}

