export const HOLIDAY_INFO = [
  { month: 1,
    fixedType: [
      {day: 1, useYears:[{ start: 1949, end: 9999, name:'元日' }]},
      {day: 3, useYears:[{ start: 1874, end: 1948, name:'元始際' }]},
      {day: 5, useYears:[{ start: 1872, end: 1948, name:'新年宴会' }]},
      {day: 15, useYears:[{ start: 1948, end: 1999, name:'成人の日' }]}
    ],
    irregular: [
      {day:0, name: '成人の日', type: 'weekly', weekly: {th: 2, week: 1}, useYears:[{start: 2000, end: 9999}]}, /*th番目のweek曜日(0:sun,1:mon...) */
    ],
  },
  { month: 2,
    fixedType: [
      {day: 11, useYears:[
        { start: 1873, end: 1948, name: '紀元節' },
        { start: 1949, end: 9999, name: '建国記念日' }
      ]},
      {day: 23, useYears:[
        { start: 2020, end: 9999, name: '天皇誕生日' },
      ]}
    ]
  },
  { month: 3,
    fixedType: [],
    irregular: [
      {day:0, name: '春季皇霊祭', type: 'springEquinox', useYears:[{start: 1879, end: 1948}]},
      {day:0, name: '春分の日', type: 'springEquinox', useYears:[{start: 1949, end: 9999}]}
    ]
  },
  { month: 4,
    fixedType: [
      {day: 29, useYears:[
        {start: 1927, end: 1948, name: '天長節'}, 
        {start: 1949, end: 1988, name: '天皇誕生日'}, 
        {start: 1989, end: 2006, name: 'みどりの日'}, 
        {start: 2007, end: 9999, name: '昭和の日'}]}, 
    ],
    irregular: [
    ]
  },
  { month: 5,
    fixedType: [
      {day: 1, useYears:[{start: 2019, end: 2019, name: '天皇の即位の日'}]},
      {day: 2, useYears:[
        {start: 2019, end: 2019, name: '国民の休日'}],
      },
      {day: 3, useYears:[{start: 1949, end: 3000, name: '憲法記念日'}]},
      {day: 4, useYears:[
        {start: 2003, end: 2003, name: '国民の休日'},
        {start: 2007, end: 3000, name: 'みどりの日'}]
      },
      {day: 5, useYears:[{start: 1949, end: 3000, name: 'こどもの日'}]}
    ],
    irregular: [
    ]
  },
  { month: 6,
  },
  { month: 7,
    fixedType: [
      {day: 20, useYears:[{start: 1996, end: 2002, name: '海の日'}]},
      {day: 22, useYears:[{start: 2021, end: 2021, name: '海の日'}]},
      {day: 23, useYears:[
        {start: 2020, end: 2020, name: '海の日'},
        {start: 2021, end: 2021, name: 'スポーツの日'}]
      },
      {day: 24, useYears:[ {start: 2020, end: 2020, name: 'スポーツの日'}]},
    ],
    irregular: [
      {day: 0, name: '海の日', type: 'weekly', weekly: {th: 3, week: 1}, useYears:[{start: 2003, end: 2019},{start: 2022,end:9999}]}
    ]
  },
  { month: 8,
    fixedType: [
      {day: 8, useYears:[{start: 2021, end: 2021, name: '山の日'}]},
      {day: 10, useYears:[{start: 2020, end: 2020, name: '山の日'}]},
      {day: 11, useYears:[
        {start: 2016, end: 2019, name: '山の日'},
        {start: 2022, end: 9999, name: '山の日'}]
      },
    ],
  },
  { month: 9,
    fixedType: [
      {day: 15, useYears:[{start: 1966, end: 2002, name: '敬老の日'}]},
      {day: 22, useYears:[{start: 2009, end: 2009, name: '国民の休日'}]},
    ],
    irregular: [
      {day: 0, name: '敬老の日', type: 'weekly', weekly: {th: 3, week: 1}, useYears:[{start: 2003, end: 9999}]},
      {day: 0, name: '秋季皇霊祭', type: 'autumnEquinox', useYears:[{start: 1878, end: 1947}]},
      {day: 0, name: '秋分の日', type: 'autumnEquinox', useYears:[{start: 1948, end: 9999}]}
    ]
  },
  { month: 10,
    fixedType: [ 
      {day: 10, useYears:[{start: 1966, end: 1999, name: '体育の日'}]},
    ], 
    irregular: [
      {day: 0, name: '体育の日', type: 'weekly', weekly: {th: 2, week: 1}, useYears:[{start: 2000, end: 2019}]},
      {day: 0, name: 'スポーツの日', type: 'weekly', weekly: {th: 2, week: 1}, useYears:[{start: 2022, end: 9999}]},
    ]
  },
  { month: 11,
    fixedType: [
      {day: 3, useYears:[{start: 1949, end: 9999, name: '文化の日'}]},
      {day: 23, useYears:[{start: 1949, end: 9999, name: '勤労感謝の日'}]},
    ],
    irregular: [
    ]
  },
  { month: 12,
    fixedType: [
      {day: 23, useYears:[{start: 1989, end: 2018, name: '天皇誕生日'}]},
    ],
    irregular: [
    ]
  }
];

/* 振替休日制度 */
export const TRANSFER_HOLIDAY = [
  {start: 1988, end: 9999},
];
