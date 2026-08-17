export type Language = 'th' | 'en';

export interface Translations {
  common: {
    title: string;
    openSource: string;
    viewOnGithub: string;
    toggleDark: string;
    toggleLanguage: string;
    switchLangTo: string;
    exitAdmin: string;
    copiedToast: string;
    close: string;
    cancel: string;
    save: string;
    saving: string;
    now: string;
    today: string;
    hoursAgo: string;
    daysAgo: string;
    to: string;
    reset: string;
    loading: string;
  };
  header: {
    subscribeBtn: string;
  };
  tabs: {
    currentStatus: string;
    incidents: string;
    uptime: string;
    admin: string;
  };
  banner: {
    operational: string;
    degraded: string;
    outage: string;
    zeroIncidents: string;
    incidentsCount: string;
    checkedAgo: string;
  };
  componentList: {
    showingChecks: string;
    clickToCopyDiagnostic: string;
    uptimeOverDays: string;
    viewHistoricalUptime: string;
    last288Checks: string;
    past90Days: string;
    operational: string;
    degraded: string;
    partialOutage: string;
    majorOutage: string;
    maintenance: string;
    noData: string;
    twentyFourHoursAgo: string;
    ninetyDaysAgo: string;
    uptime288Summary: string;
    uptime90Summary: string;
    copiedComponentData: string;
    noPingRecorded: string;
  };
  chart: {
    title: string;
    subtitle: string;
    allEndpoints: string;
    noData24h: string;
    hoursAgo24: string;
    hoursAgo12: string;
    now: string;
    copiedLatency: string;
    clickToCopy: string;
  };
  pastIncidents: {
    title: string;
    zeroIncidents24h: string;
    incidentsCount24h: string;
    noIncidentsReported: string;
    viewFullHistory: string;
  };
  incidentHistory: {
    allComponents: string;
    allImpacts: string;
    impactCritical: string;
    impactMajor: string;
    impactMinor: string;
    impactNone: string;
    resetFilters: string;
    olderIncidents: string;
    newerIncidents: string;
    noIncidentsMatchFilter: string;
    noIncidentsReported: string;
    collapseIncidents: string;
    showAllIncidents: string;
  };
  uptimeGrid: {
    selectComponent: string;
    prev3Months: string;
    next3Months: string;
    operational100: string;
    degraded: string;
    majorOutage: string;
    maintenance: string;
    noData: string;
    copiedUptime: string;
    clickToCopyDiagnostic: string;
    noDataRecorded: string;
  };
  subscribe: {
    modalTitle: string;
    modalSubtitle: string;
    channelTitle: string;
    officialBadge: string;
    channelHandle: string;
    feature1: string;
    feature2: string;
    feature3: string;
    joinBtn: string;
    footerNote: string;
  };
  footer: {
    communityTitle: string;
    communitySubtitle: string;
    youtube: string;
    youtubeDesc: string;
    twitter: string;
    twitterDesc: string;
    facebook: string;
    facebookDesc: string;
    discord: string;
    discordDesc: string;
    gatewaySite: string;
    gatewaySiteDesc: string;
    disclaimer: string;
  };
  admin: {
    authTitle: string;
    authSubtitle: string;
    serviceKeyLabel: string;
    serviceKeyHint: string;
    unlockBtn: string;
    panelTitle: string;
    panelSubtitle: string;
    postNewBtn: string;
    refreshList: string;
    lockBtn: string;
    editIncident: string;
    postIncident: string;
    incidentTitleLabel: string;
    incidentTitlePlaceholder: string;
    impactLabel: string;
    impactOptionNone: string;
    impactOptionMinor: string;
    impactOptionMajor: string;
    impactOptionCritical: string;
    markResolved: string;
    messageLabel: string;
    messagePlaceholder: string;
    updateBtn: string;
    publishBtn: string;
    recordedIncidents: string;
    emptyIncidents: string;
    statusResolved: string;
    statusActive: string;
    createdPrefix: string;
    resolvedPrefix: string;
    resolveBtn: string;
    editBtn: string;
    deleteBtn: string;
    fillRequiredAlert: string;
    updateSuccessAlert: string;
    postSuccessAlert: string;
    resolveSuccessAlert: string;
    deleteSuccessAlert: string;
    confirmResolve: string;
    confirmDelete: string;
  };
}

export const translations: Record<Language, Translations> = {
  th: {
    common: {
      title: 'สถานะระบบ Gateway 9arm',
      openSource: 'โอเพนซอร์ส',
      viewOnGithub: 'ดูซอร์สโค้ดบน GitHub',
      toggleDark: 'สลับโหมดมืด / สว่าง',
      toggleLanguage: 'เปลี่ยนภาษา / Switch Language',
      switchLangTo: 'Switch to English',
      exitAdmin: '← ออกจากโหมดผู้ดูแลระบบ',
      copiedToast: 'คัดลอกข้อมูลแล้ว',
      close: 'ปิด',
      cancel: 'ยกเลิก',
      save: 'บันทึก',
      saving: 'กำลังบันทึก...',
      now: 'ปัจจุบัน',
      today: 'วันนี้',
      hoursAgo: 'ชั่วโมงที่แล้ว',
      daysAgo: 'วันที่แล้ว',
      to: 'ถึง',
      reset: 'ล้างตัวกรอง',
      loading: 'กำลังโหลดข้อมูล...',
    },
    header: {
      subscribeBtn: 'รับการแจ้งเตือนสถานะ',
    },
    tabs: {
      currentStatus: 'สถานะปัจจุบัน',
      incidents: 'เหตุขัดข้อง',
      uptime: 'ความพร้อมใช้งาน (Uptime)',
      admin: '⚙ จัดการระบบ',
    },
    banner: {
      operational: 'ระบบทั้งหมดทำงานได้ตามปกติ',
      degraded: 'ประสิทธิภาพการทำงานลดลง',
      outage: 'ระบบขัดข้องรุนแรง',
      zeroIncidents: 'ไม่มีเหตุขัดข้องใน 24 ชม.',
      incidentsCount: '{count} เหตุขัดข้องใน 24 ชม.',
      checkedAgo: 'ตรวจสอบเมื่อ {time}',
    },
    componentList: {
      showingChecks: 'แสดงผลการตรวจสอบสถานะ {count} ครั้งล่าสุด (~24 ชั่วโมง)',
      clickToCopyDiagnostic: '(คลิกที่แท่งเพื่อคัดลอกข้อมูลการวิเคราะห์)',
      uptimeOverDays: 'ความพร้อมใช้งานในช่วง {days} วันที่ผ่านมา',
      viewHistoricalUptime: 'ดูประวัติความพร้อมใช้งานย้อนหลัง',
      last288Checks: '288 รายการล่าสุด (24 ชม.)',
      past90Days: '90 วันที่ผ่านมา',
      operational: 'ใช้งานได้ตามปกติ',
      degraded: 'ประสิทธิภาพลดลง',
      partialOutage: 'ขัดข้องบางส่วน',
      majorOutage: 'ระบบขัดข้องรุนแรง',
      maintenance: 'อยู่ระหว่างปรับปรุงระบบ',
      noData: 'ไม่มีข้อมูล',
      twentyFourHoursAgo: '24 ชั่วโมงที่แล้ว',
      ninetyDaysAgo: '90 วันที่แล้ว',
      uptime288Summary: 'ความพร้อมใช้งาน {pct}% (ตรวจสอบ 288 ครั้ง)',
      uptime90Summary: 'ความพร้อมใช้งาน {pct}%',
      copiedComponentData: 'คัดลอกข้อมูล {name} แล้ว ({time})',
      noPingRecorded: 'ไม่มีการบันทึกข้อมูลการตรวจสอบ',
    },
    chart: {
      title: 'เวลาตอบสนองและความหน่วง (Latency 24 ชม.)',
      subtitle: 'การวัดความหน่วงของแต่ละบริการอย่างต่อเนื่อง · (คลิกจุดใดก็ได้เพื่อคัดลอกข้อมูล)',
      allEndpoints: 'ทุกบริการ (แสดงทุกเส้น)',
      noData24h: 'ไม่มีข้อมูลการวัดความหน่วงในช่วง 24 ชั่วโมงที่ผ่านมา',
      hoursAgo24: '24 ชม. ที่แล้ว',
      hoursAgo12: '12 ชม. ที่แล้ว',
      now: 'ปัจจุบัน',
      copiedLatency: 'คัดลอกข้อมูลความหน่วง ({ms}ms เมื่อ {time}) แล้ว',
      clickToCopy: 'คลิกเพื่อคัดลอก',
    },
    pastIncidents: {
      title: 'เหตุขัดข้องที่ผ่านมา',
      zeroIncidents24h: 'ไม่มีเหตุขัดข้องใน 24 ชั่วโมงที่ผ่านมา',
      incidentsCount24h: '{count} เหตุขัดข้องใน 24 ชั่วโมงที่ผ่านมา',
      noIncidentsReported: 'ไม่มีรายงานเหตุขัดข้อง',
      viewFullHistory: '← ดูประวัติเหตุขัดข้องทั้งหมด',
    },
    incidentHistory: {
      allComponents: 'ทุกบริการ / คอมโพเนนต์',
      allImpacts: 'ทุกระดับผลกระทบ',
      impactCritical: 'วิกฤต (Critical)',
      impactMajor: 'รุนแรง (Major)',
      impactMinor: 'เล็กน้อย (Minor)',
      impactNone: 'แจ้งเพื่อทราบ (Informational)',
      resetFilters: 'ล้างตัวกรอง',
      olderIncidents: 'เหตุการณ์ก่อนหน้า',
      newerIncidents: 'เหตุการณ์ล่าสุด',
      noIncidentsMatchFilter: 'ไม่พบเหตุขัดข้องที่ตรงกับตัวกรองในเดือนนี้',
      noIncidentsReported: 'ไม่มีรายงานเหตุขัดข้อง',
      collapseIncidents: '- ย่อรายการเหตุการณ์',
      showAllIncidents: '+ แสดงเหตุการณ์ทั้งหมด {count} รายการ',
    },
    uptimeGrid: {
      selectComponent: 'เลือกบริการเพื่อดูความพร้อมใช้งาน',
      prev3Months: '3 เดือนก่อนหน้า',
      next3Months: '3 เดือนถัดไป',
      operational100: 'ใช้งานได้ตามปกติ (100%)',
      degraded: 'ประสิทธิภาพลดลง',
      majorOutage: 'ระบบขัดข้องรุนแรง',
      maintenance: 'ปิดปรับปรุง',
      noData: 'ไม่มีข้อมูล',
      copiedUptime: 'คัดลอกข้อมูลความพร้อมใช้งาน {name} แล้ว ({date})',
      clickToCopyDiagnostic: 'คลิกเพื่อคัดลอกข้อมูล JSON สำหรับวิเคราะห์',
      noDataRecorded: 'ไม่มีการบันทึกข้อมูล',
    },
    subscribe: {
      modalTitle: 'รับการแจ้งเตือนสถานะระบบ (Subscribe)',
      modalSubtitle: 'รับการแจ้งเตือนทันทีเมื่อระบบขัดข้องหรือกลับมาใช้งานได้ปกติ',
      channelTitle: 'Telegram Broadcast Channel',
      officialBadge: 'OFFICIAL',
      channelHandle: 'ช่องทางแจ้งเตือน: @gateway9armstatus',
      feature1: 'แจ้งเตือนทันทีแบบ Real-time เมื่อตรวจพบระบบขัดข้อง',
      feature2: 'แจ้งเตือนอัตโนมัติเมื่อระบบกลับมาใช้งานได้ปกติ',
      feature3: 'บรอดแคสต์อัตโนมัติผ่าน @th9arm_bot ตลอด 24 ชม.',
      joinBtn: 'เข้าร่วมช่อง @gateway9armstatus',
      footerNote: 'ไม่ต้องลงทะเบียนหรือกรอกอีเมล เพียงกดเปิดใน Telegram เพื่อเข้าร่วม',
    },
    footer: {
      communityTitle: '9arm Community & แพลตฟอร์มผู้พัฒนา',
      communitySubtitle: 'เกตเวย์ให้บริการโดย นายอาร์ม (9arm) · ติดตาม ร่วมแลกเปลี่ยน และสนับสนุนผลงานได้ที่',
      youtube: 'YouTube @9arm.',
      youtubeDesc: 'ไลฟ์สตรีม เรื่องเล่าไอที และสิทธิประโยชน์สมาชิก',
      twitter: 'X @castby9arm',
      twitterDesc: 'อัปเดตข่าวสารไอที สรุปประเด็น และความคิดเห็นด่วน',
      facebook: 'Behind the Scenes with 9arm',
      facebookDesc: 'กลุ่มคอมมูนิตี้แลกเปลี่ยนเรื่องเทคโนโลยี',
      discord: 'Discord Server',
      discordDesc: 'คอมมูนิตี้แชทและกลุ่มผู้สนับสนุนโปรเจกต์',
      gatewaySite: 'gateway.9arm.co',
      gatewaySiteDesc: 'หน้าเว็บไซต์ทางการของ API Gateway',
      disclaimer: 'สถานะระบบนี้เป็นเครื่องมืออิสระที่จัดทำขึ้นโดยคอมมูนิตี้ (Open Source) เพื่อตรวจสอบการเข้าถึง ไม่ได้ดำเนินการอย่างเป็นทางการโดยตรง',
    },
    admin: {
      authTitle: 'ระบบจัดการเหตุขัดข้อง (ผู้ดูแลระบบ)',
      authSubtitle: 'ยืนยันตัวตนด้วย Supabase Service Role Key เพื่อจัดการเหตุการณ์',
      serviceKeyLabel: 'Supabase Service Role Key',
      serviceKeyHint: 'ค้นหาได้ที่: Supabase Dashboard → Project Settings → API → `service_role` secret',
      unlockBtn: 'ปลดล็อกแผงควบคุม',
      panelTitle: 'การจัดการเหตุขัดข้อง',
      panelSubtitle: 'โพสต์อัปเดตสถานะ จัดการเหตุขัดข้อง และบันทึกการแก้ไขปัญหา',
      postNewBtn: 'โพสต์เหตุการณ์ใหม่',
      refreshList: 'รีเฟรชรายการ',
      lockBtn: 'ล็อกระบบ',
      editIncident: 'แก้ไขเหตุการณ์',
      postIncident: 'โพสต์เหตุการณ์ใหม่',
      incidentTitleLabel: 'หัวข้อเหตุการณ์',
      incidentTitlePlaceholder: 'เช่น ความหน่วงสูงขึ้นใน gateway.9arm.co',
      impactLabel: 'ระดับผลกระทบ',
      impactOptionNone: 'ไม่มีผลกระทบ / แจ้งเพื่อทราบ',
      impactOptionMinor: 'ผลกระทบเล็กน้อย (เหลือง)',
      impactOptionMajor: 'ผลกระทบรุนแรง (ส้ม)',
      impactOptionCritical: 'วิกฤต (แดง)',
      markResolved: 'ระบุว่าแก้ไขแล้ว',
      messageLabel: 'ข้อความสถานะ / รายละเอียดอัปเดต',
      messagePlaceholder: 'อธิบายสิ่งที่เกิดขึ้น ขั้นตอนการตรวจสอบ หรือรายละเอียดการแก้ไข...',
      updateBtn: 'อัปเดตเหตุการณ์',
      publishBtn: 'เผยแพร่เหตุการณ์',
      recordedIncidents: 'เหตุการณ์ที่บันทึกไว้ ({count})',
      emptyIncidents: 'ไม่พบเหตุการณ์ในฐานข้อมูล คลิก "โพสต์เหตุการณ์ใหม่" เพื่อสร้าง',
      statusResolved: 'แก้ไขแล้ว',
      statusActive: 'กำลังเกิดขึ้น',
      createdPrefix: 'สร้างเมื่อ:',
      resolvedPrefix: 'แก้ไขเมื่อ:',
      resolveBtn: 'ทำเครื่องหมายว่าแก้ไขแล้ว',
      editBtn: 'แก้ไขเหตุการณ์',
      deleteBtn: 'ลบเหตุการณ์',
      fillRequiredAlert: 'กรุณากรอกทั้งหัวข้อและข้อความ',
      updateSuccessAlert: 'อัปเดตเหตุการณ์เรียบร้อยแล้ว',
      postSuccessAlert: 'โพสต์เหตุการณ์ใหม่เรียบร้อยแล้ว',
      resolveSuccessAlert: 'ทำเครื่องหมายว่าเหตุการณ์ "{name}" ได้รับการแก้ไขแล้ว',
      deleteSuccessAlert: 'ลบเหตุการณ์ "{name}" เรียบร้อยแล้ว',
      confirmResolve: 'ต้องการทำเครื่องหมายว่า "{name}" ได้รับการแก้ไขแล้วหรือไม่?',
      confirmDelete: 'คุณแน่ใจหรือไม่ว่าต้องการลบ "{name}" ถาวร?',
    },
  },
  en: {
    common: {
      title: 'Gateway 9arm Status',
      openSource: 'Open source',
      viewOnGithub: 'View on GitHub',
      toggleDark: 'Toggle dark mode',
      toggleLanguage: 'Switch language / เปลี่ยนภาษา',
      switchLangTo: 'เปลี่ยนเป็นภาษาไทย',
      exitAdmin: '← Exit Admin Mode',
      copiedToast: 'Data copied to clipboard',
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      now: 'Now',
      today: 'Today',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      to: 'to',
      reset: 'Reset',
      loading: 'Loading data...',
    },
    header: {
      subscribeBtn: 'Subscribe to Updates',
    },
    tabs: {
      currentStatus: 'Current Status',
      incidents: 'Incidents',
      uptime: 'Uptime',
      admin: '⚙ Admin',
    },
    banner: {
      operational: 'All Systems Operational',
      degraded: 'Degraded Performance',
      outage: 'Major Outage',
      zeroIncidents: '0 incidents in 24h',
      incidentsCount: '{count} incident{s} in 24h',
      checkedAgo: 'Checked {time}',
    },
    componentList: {
      showingChecks: 'Showing the last {count} health checks (~24 hours).',
      clickToCopyDiagnostic: '(Click any bar to copy diagnostic data)',
      uptimeOverDays: 'Uptime over the past {days} days.',
      viewHistoricalUptime: 'View historical uptime.',
      last288Checks: 'Last 288 entries (24h)',
      past90Days: 'Past 90 days',
      operational: 'Operational',
      degraded: 'Degraded Performance',
      partialOutage: 'Partial Outage',
      majorOutage: 'Major Outage',
      maintenance: 'Under Maintenance',
      noData: 'No Data',
      twentyFourHoursAgo: '24 hours ago',
      ninetyDaysAgo: '90 days ago',
      uptime288Summary: '{pct}% uptime (288 checks)',
      uptime90Summary: '{pct}% uptime',
      copiedComponentData: 'Copied {name} data ({time})',
      noPingRecorded: 'No ping recorded',
    },
    chart: {
      title: 'Response Time & Latency (24h)',
      subtitle: 'Continuous multi-service latency measurements · (Click any point to copy)',
      allEndpoints: 'All Endpoints (Multi-line)',
      noData24h: 'No latency measurements recorded in the last 24 hours.',
      hoursAgo24: '24h ago',
      hoursAgo12: '12h ago',
      now: 'Now',
      copiedLatency: 'Copied latency data ({ms}ms at {time})',
      clickToCopy: 'Click to copy',
    },
    pastIncidents: {
      title: 'Past Incidents',
      zeroIncidents24h: '0 incidents in past 24 hours',
      incidentsCount24h: '{count} incident{s} in past 24 hours',
      noIncidentsReported: 'No incidents reported.',
      viewFullHistory: '← View full incident history',
    },
    incidentHistory: {
      allComponents: 'All Components',
      allImpacts: 'All Impact Levels',
      impactCritical: 'Critical',
      impactMajor: 'Major',
      impactMinor: 'Minor',
      impactNone: 'Informational',
      resetFilters: 'Reset',
      olderIncidents: 'Older incidents',
      newerIncidents: 'Newer incidents',
      noIncidentsMatchFilter: 'No incidents match the active filters for this month.',
      noIncidentsReported: 'No incidents reported.',
      collapseIncidents: '- Collapse Incidents',
      showAllIncidents: '+ Show All {count} Incidents',
    },
    uptimeGrid: {
      selectComponent: 'Select component to view uptime',
      prev3Months: 'Previous 3 months',
      next3Months: 'Next 3 months',
      operational100: 'Operational (100%)',
      degraded: 'Degraded performance',
      majorOutage: 'Major outage',
      maintenance: 'Maintenance',
      noData: 'No data',
      copiedUptime: 'Copied {name} uptime ({date})',
      clickToCopyDiagnostic: 'Click to copy JSON diagnostic data',
      noDataRecorded: 'No data recorded',
    },
    subscribe: {
      modalTitle: 'Subscribe to Status Updates',
      modalSubtitle: 'Get instant notifications when incidents occur or are resolved',
      channelTitle: 'Telegram Broadcast Channel',
      officialBadge: 'OFFICIAL',
      channelHandle: 'Notification Channel: @gateway9armstatus',
      feature1: 'Real-time instant alerts when service disruption is detected',
      feature2: 'Automatic notifications when services recover',
      feature3: 'Automated 24/7 broadcast via @th9arm_bot',
      joinBtn: 'Join @gateway9armstatus Channel',
      footerNote: 'No registration or email required. Simply open in Telegram to join.',
    },
    footer: {
      communityTitle: '9arm Community & Ecosystem',
      communitySubtitle: 'Gateway infrastructure is provided by 9arm · Connect with community hubs & channel projects',
      youtube: 'YouTube @9arm.',
      youtubeDesc: 'Live streams, tech chats & channel supporters',
      twitter: 'X @castby9arm',
      twitterDesc: 'Tech updates, quick thoughts & commentary',
      facebook: 'Behind the Scenes with 9arm',
      facebookDesc: 'Public Facebook group for tech discussions',
      discord: 'Discord Community',
      discordDesc: 'Live discussion & member supporters chat',
      gatewaySite: 'gateway.9arm.co',
      gatewaySiteDesc: 'Official Anthropic-compatible Gateway portal',
      disclaimer: 'This status page is an independent open-source community tool and is not directly managed or endorsed by the gateway operator.',
    },
    admin: {
      authTitle: 'Admin Incident Management',
      authSubtitle: 'Authenticate with your Supabase Service Role Key to manage incidents.',
      serviceKeyLabel: 'Supabase Service Role Key',
      serviceKeyHint: 'Found in: Supabase Dashboard → Project Settings → API → `service_role` secret.',
      unlockBtn: 'Unlock Admin Panel',
      panelTitle: 'Incident Administration',
      panelSubtitle: 'Post status updates, manage active outages, and record resolutions.',
      postNewBtn: 'Post New Incident',
      refreshList: 'Refresh list',
      lockBtn: 'Lock',
      editIncident: 'Edit Incident',
      postIncident: 'Post New Incident',
      incidentTitleLabel: 'Incident Title',
      incidentTitlePlaceholder: 'e.g. Elevated latency on gateway.9arm.co',
      impactLabel: 'Impact Level',
      impactOptionNone: 'None / Informational',
      impactOptionMinor: 'Minor (Yellow)',
      impactOptionMajor: 'Major (Orange)',
      impactOptionCritical: 'Critical (Red)',
      markResolved: 'Mark as Resolved',
      messageLabel: 'Status Message / Update',
      messagePlaceholder: 'Describe what happened, current investigations, or the resolution details...',
      updateBtn: 'Update Incident',
      publishBtn: 'Publish Incident',
      recordedIncidents: 'Recorded Incidents ({count})',
      emptyIncidents: 'No incidents found in database. Click "Post New Incident" to create one.',
      statusResolved: 'Resolved',
      statusActive: 'Active',
      createdPrefix: 'Created:',
      resolvedPrefix: 'Resolved:',
      resolveBtn: 'Resolve',
      editBtn: 'Edit Incident',
      deleteBtn: 'Delete Incident',
      fillRequiredAlert: 'Please fill in both the title and the message.',
      updateSuccessAlert: 'Incident updated successfully.',
      postSuccessAlert: 'New incident posted successfully.',
      resolveSuccessAlert: 'Incident "{name}" marked as resolved.',
      deleteSuccessAlert: 'Incident "{name}" deleted.',
      confirmResolve: 'Mark "{name}" as resolved?',
      confirmDelete: 'Are you sure you want to permanently delete "{name}"?',
    },
  },
};
