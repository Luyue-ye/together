// 会议日历的内置数据（2026 年 11 月 12 日核对）
// deadline: 已公布的投稿截止日（YYYY-MM-DD）；null 表示还没公布
// prev: 往届截止日（只作参考，月-日）
// placeTBA: 地点未公布；placeCheck: 地点来自第三方，待官网确认
// 每年更新时改这个文件即可。

export const FIELDS = ['comm', 'china', 'feminist', 'aging', 'health', 'polisci', 'polcomm', 'internet', 'ai'];

export const CONFERENCES = [
  { id: 'ica27', short: 'ICA', year: 2027, full: 'International Communication Association', place: 'Glasgow, UK', dates: '2027-06-03/2027-06-07', deadline: '2026-11-02', url: 'https://www.icahdq.org/mpage/ICA27-calls-for-papers', tags: ['comm', 'polcomm', 'health', 'ai'] },
  { id: 'aejmcmw27', short: 'AEJMC Midwinter', year: 2027, full: 'AEJMC Midwinter Conference', place: 'Milwaukee, WI (Marquette University)', dates: '2027-03-04/2027-03-06', deadline: '2026-12-15', url: 'https://www.marquette.edu/communication/aejmc-2027.php', tags: ['comm'] },
  { id: 'aejmc27', short: 'AEJMC', year: 2027, full: 'Association for Education in Journalism and Mass Communication', place: 'Chicago, IL', dates: '2027-08-09/2027-08-12', deadline: null, prev: '04-01', url: 'https://aejmc.us/events/future-conferences/', tags: ['comm', 'polcomm'] },
  { id: 'nca27', short: 'NCA', year: 2027, full: 'National Communication Association, 113th Convention', place: '', placeTBA: true, dates: '', deadline: null, prev: '03-25', url: 'https://www.natcom.org/', tags: ['comm'] },
  { id: 'iamcr27', short: 'IAMCR', year: 2027, full: 'International Association for Media and Communication Research', place: 'São Paulo, Brazil', dates: '2027-07-18/2027-07-22', deadline: null, prev: '02-03', url: 'https://iamcr.org/', tags: ['comm', 'polcomm', 'feminist', 'health'] },
  { id: 'aas27', short: 'AAS', year: 2027, full: 'Association for Asian Studies Annual Conference', place: 'Boston, MA', dates: '2027-03-18/2027-03-21', deadline: null, closed: true, url: 'https://www.asianstudies.org/conference/', tags: ['china'] },
  { id: 'aasasia27', short: 'AAS-in-Asia', year: 2027, full: 'AAS-in-Asia (Sunway University)', place: 'Kuala Lumpur, Malaysia', dates: '2027-07-01/2027-07-03', deadline: '2026-10-30', url: 'https://sunwayuniversity.edu.my/conference/aas-2027', tags: ['china'] },
  { id: 'isa27', short: 'ISA', year: 2027, full: 'International Studies Association Annual Convention', place: 'Atlanta, GA', dates: '2027-03-21/2027-03-24', deadline: '2026-06-01', url: 'https://www.isanet.org/', tags: ['polisci', 'china'] },
  { id: 'mpsa27', short: 'MPSA', year: 2027, full: 'Midwest Political Science Association Conference', place: 'Chicago, IL', dates: '2027-04-01/2027-04-04', deadline: '2026-10-06', url: 'https://www.mpsanet.org/conference/', tags: ['polisci', 'polcomm'] },
  { id: 'apsa27', short: 'APSA', year: 2027, full: 'American Political Science Association Annual Meeting', place: 'Washington, DC', dates: '2027-09-02/2027-09-05', deadline: null, prev: '01-14', url: 'https://apsanet.org/events/', tags: ['polisci', 'polcomm'] },
  { id: 'nwsa27', short: 'NWSA', year: 2027, full: "National Women's Studies Association", place: 'St. Louis, MO', dates: '2027-11-18/2027-11-21', deadline: null, url: 'https://www.nwsa.org/news-events/past-future-conferences', tags: ['feminist'] },
  { id: 'gsa27', short: 'GSA', year: 2027, full: 'Gerontological Society of America Annual Scientific Meeting', place: 'Phoenix, AZ', placeCheck: true, dates: '2027-11-03/2027-11-07', deadline: null, prev: '03-05', url: 'https://www.geron.org/', tags: ['aging', 'health'] },
  { id: 'dchc27', short: 'DCHC', year: 2027, full: 'D.C. Health Communication Conference (biennial)', place: 'Washington, DC area', placeCheck: true, dates: '2027-04-23/2027-04-25', deadline: '2026-12-01', url: 'https://dchc.gmu.edu/about/', tags: ['health'] },
  { id: 'kchc28', short: 'KCHC', year: 2028, full: 'Kentucky Conference on Health Communication (biennial)', place: 'Lexington, KY', dates: '', deadline: null, prev: '12-01', url: 'https://comm.uky.edu/kchc', tags: ['health'] },
  { id: 'aoir27', short: 'AoIR', year: 2027, full: 'Association of Internet Researchers', place: '', placeTBA: true, dates: '', deadline: null, prev: '03-01', url: 'https://aoir.org/', tags: ['internet', 'ai'] },
  { id: 'icwsm27', short: 'ICWSM', year: 2027, full: 'AAAI Conference on Web and Social Media (round 3)', place: 'Edinburgh, UK', dates: '', deadline: '2027-01-15', url: 'https://www.icwsm.org/2027/', tags: ['internet', 'ai'] },
  { id: 'facct27', short: 'FAccT', year: 2027, full: 'ACM Conference on Fairness, Accountability, and Transparency', place: 'Porto, Portugal', dates: '2027-06-21/2027-06-24', deadline: '2026-11-03', url: 'https://facctconference.org/2027/cfp.html', tags: ['ai'] }
];
