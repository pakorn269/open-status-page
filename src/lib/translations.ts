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
    limits: string;
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
    rateLimited: string;
    quotaExhausted: string;
    quotaTitle: string;
    remainingTokens: string;
    maxConcurrency: string;
    keyBudget: string;
    tpmTokens: string;
    concurrencySlots: string;
    concurrencyNotice: string;
    tpmCapNotice: string;
    tierSubtitle: string;
  };
  rateLimitBanner: {
    title: string;
    desc: string;
    concurrencyInUse: string;
    concurrencyFull: string;
    concurrencyAvailable: string;
    tokensAvailable: string;
    budgetUsed: string;
    viewFaqBtn: string;
  };
  usageLimits: {
    title: string;
    subtitle: string;
    allNormal: string;
    throttledNotice: string;
    concurrencyTitle: string;
    concurrencyDesc: string;
    tokensTitle: string;
    tokensDesc: string;
    budgetTitle: string;
    budgetDesc: string;
    remaining: string;
    used: string;
    capacity: string;
    freeSlots: string;
    perModelTitle: string;
    perModelSubtitle: string;
    historyTitle: string;
    historySubtitle: string;
    no429In24h: string;
    recent429Found: string;
    colTimestamp: string;
    colEndpoint: string;
    colStatus: string;
    colDetails: string;
    devTipsTitle: string;
    devTipsDesc: string;
    quickSwitchFaq: string;
  };
  userQuotaChecker: {
    title: string;
    subtitle: string;
    securityBadge: string;
    securityDisclaimer: string;
    inputLabel: string;
    inputPlaceholder: string;
    checkBtn: string;
    checkingBtn: string;
    clearBtn: string;
    curlTab: string;
    curlDesc: string;
    curlCopied: string;
    copyCurlBtn: string;
    resultTitle: string;
    statusValid: string;
    statusInvalid: string;
    statusThrottled: string;
    concurrencyLabel: string;
    tpmLabel: string;
    budgetLabel: string;
    latencyLabel: string;
    checkedAtLabel: string;
    slotsFree: string;
    tokenRemaining: string;
    budgetRemaining: string;
    emptyInputAlert: string;
    errorPrefix: string;
  };
  faq: {
    title: string;
    subtitle: string;
    tagRateLimit: string;
    tagQuota: string;
    tagTransparency: string;
    q1Title: string;
    q1Answer: string;
    q2Title: string;
    q2Answer: string;
    q3Title: string;
    q3Answer: string;
    q4Title: string;
    q4Answer: string;
  };
  chart: {
    title: string;
    titleWithRange: string;
    subtitle: string;
    allEndpoints: string;
    noData: string;
    noData24h: string;
    hoursAgo24: string;
    hoursAgo12: string;
    now: string;
    copiedLatency: string;
    clickToCopy: string;
    liveBadge: string;
    updatedJustNow: string;
    range1h: string;
    range6h: string;
    range24h: string;
    range7d: string;
    rangeLabel1h: string;
    rangeLabel6h: string;
    rangeLabel24h: string;
    rangeLabel7d: string;
    avg: string;
    p95: string;
    min: string;
    max: string;
    current: string;
  };
  announcements: {
    title: string;
    badgeNotice: string;
    badgeModelUpdate: string;
    badgeMaintenance: string;
    badgeFeature: string;
    viewHistoryBtn: string;
    discordRefBtn: string;
    dismiss: string;
    showNotice: string;
    latestNoticeTitle: string;
    latestNoticeDesc: string;
    modelOfflineNote: string;
  };
  changeHistory: {
    modalTitle: string;
    modalSubtitle: string;
    allChanges: string;
    filterLabel: string;
    closeBtn: string;
    referenceLink: string;
  };
  pastIncidents: {
    title: string;
    zeroIncidents24h: string;
    incidentsCount24h: string;
    noIncidentsReported: string;
    viewFullHistory: string;
    prevPeriod: string;
    nextPeriod: string;
    todayBtn: string;
    pageOf: string;
    daysCount: string;
    showMoreIncidents: string;
    showFewerIncidents: string;
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
    operational: string;
    operational100: string;
    operationalWithPct: string;
    degraded: string;
    degradedWithPct: string;
    majorOutage: string;
    outageWithPct: string;
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
      limits: 'โควตา & ขีดจำกัด',
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
      rateLimited: 'จำกัดการใช้งาน (Rate Limited)',
      quotaExhausted: 'โควตาเต็ม (Quota Exhausted)',
      quotaTitle: 'เกณฑ์โควตาต่อบัญชี (Account Tier Cap)',
      remainingTokens: 'โควตา Token (TPM)',
      maxConcurrency: 'คำขอพร้อมกันต่อ Key',
      keyBudget: 'งบประมาณ Key (บอทมอนิเตอร์)',
      tpmTokens: 'TPM Tokens',
      concurrencySlots: 'คำขอพร้อมกัน',
      concurrencyNotice: 'เกตเวย์จำกัด Concurrency ไว้สูงสุด {max} คำขอพร้อมกันต่อ Key',
      tpmCapNotice: 'จำกัดปริมาณโทเค็นไว้ที่ {limit} โทเค็นต่อนาที (TPM)',
      tierSubtitle: 'เกณฑ์จำกัดโควตาระดับบัญชีที่เกตเวย์กำหนดให้แต่ละ API Key ตาม Response Headers',
    },
    rateLimitBanner: {
      title: 'ตรวจพบการติด Usage / Rate Limit (HTTP 429)',
      desc: 'เกตเวย์กำลังจำกัดการประมวลผลชั่วคราว (เซิร์ฟเวอร์และโมเดลไม่ได้ล่ม) เนื่องจากมีคำขอใช้งานพร้อมกันเกิน 3 รายการ หรือเกินเพดาน 1,000,000 tokens/นาที แนะนำให้เว้นช่วงการส่งคำขอสักครู่แล้วลองใหม่อีกครั้ง',
      concurrencyInUse: '{inUse} จาก {total} คำขอกำลังประมวลผล',
      concurrencyFull: 'เต็มเพดาน Concurrency (3/3) — คำขอถัดไปจะได้รับ HTTP 429 ชั่วคราว',
      concurrencyAvailable: 'ว่าง {available} สล็อต Concurrency พร้อมรับคำขอ',
      tokensAvailable: 'โควตา Token คงเหลือในรอบปัจจุบัน',
      budgetUsed: 'ยอดงบประมาณ Key ที่ใช้ไป',
      viewFaqBtn: 'ทำความเข้าใจ Limit & วิธีแก้ (FAQ) ↓',
    },
    usageLimits: {
      title: 'โควตาและการจำกัดสิทธิ์ (Usage & Rate Limits)',
      subtitle: 'ติดตามเพดานการใช้งาน (Per-Key Tier Cap) และอัตราคงเหลือแบบเรียลไทม์จาก Gateway Response Headers',
      allNormal: 'อัตราการใช้งานปกติ — ไม่พบการจำกัดคำขอ',
      throttledNotice: 'ตรวจพบการจำกัดคำขอ (HTTP 429) — เกตเวย์กำลังหน่วงคำขอชั่วคราว',
      concurrencyTitle: 'คำขอพร้อมกัน (Concurrency)',
      concurrencyDesc: 'ความจุการรับส่งคำขอประมวลผลพร้อมกันในเสี้ยววินาที (ว่างทันทีที่ประมวลผลเสร็จ)',
      tokensTitle: 'โควตาโทเค็นต่อนาที (TPM)',
      tokensDesc: 'เพดานปริมาณโทเค็นรวมต่อ 1 นาที (รีเซ็ตใหม่ทุกๆ 60 วินาที)',
      budgetTitle: 'วงเงินทดสอบสะสม (Key Budget)',
      budgetDesc: 'งบประมาณสะสมของ API Key ประจำบอทมอนิเตอร์ในรอบเดือน ($50/เดือน)',
      remaining: 'คงเหลือ',
      used: 'ใช้ไปแล้ว',
      capacity: 'ความจุทั้งหมด',
      freeSlots: 'ว่าง {free} จาก {max} ช่อง',
      perModelTitle: 'สถานะโควตารายบริการ & โมเดล',
      perModelSubtitle: 'รายละเอียดความพร้อมของช่องประมวลผลและโควตาคงเหลือของแต่ละโมเดล',
      historyTitle: 'ประวัติการติด Rate Limit (429 Logs ใน 24 ชม.)',
      historySubtitle: 'บันทึกเหตุการณ์ที่คำขอตรวจสุขภาพของบอทพบ HTTP 429 ในช่วง 24 ชั่วโมงที่ผ่านมา',
      no429In24h: 'ไม่พบเหตุการณ์ติด Rate Limit (429) ในช่วง 24 ชม. ที่ผ่านมา — การประมวลผลราบรื่น 100%',
      recent429Found: 'พบการติด 429 ทั้งหมด {count} ครั้งในช่วง 24 ชั่วโมงที่ผ่านมา',
      colTimestamp: 'เวลาที่ตรวจพบ',
      colEndpoint: 'โมเดล / บริการ',
      colStatus: 'สถานะ',
      colDetails: 'รายละเอียดการจำกัด',
      devTipsTitle: 'คำแนะนำสำหรับนักพัฒนาเพื่อเลี่ยง HTTP 429',
      devTipsDesc: 'การส่งคำขอแบบมี Semaphore หรือ Concurrency Pool ขนาดไม่เกิน 3 คำขอ พร้อมการทำ Exponential Backoff (รอ 2-5 วินาทีเมื่อพบ 429) จะช่วยให้แอปพลิเคชันทำงานได้ราบรื่นที่สุด',
      quickSwitchFaq: 'อ่านคำถามที่พบบ่อย (FAQ) ด้านล่าง ↓',
    },
    userQuotaChecker: {
      title: 'ตรวจสอบโควตา API Key ของคุณ (Personal Quota Checker)',
      subtitle: 'ใส่ API Key ของคุณเพื่อตรวจสอบสถานะ Concurrency, โควตา Tokens (TPM) และวงเงินคงเหลือส่วนบุคคลแบบเรียลไทม์',
      securityBadge: 'Zero-Knowledge 100%',
      securityDisclaimer: 'ปลอดภัยสูงสุด: ระบบไม่บันทึก API Key ของคุณลงฐานข้อมูลหรือ Disk ใดๆ ทั้งสิ้น คำขอจะถูกส่งผ่าน HTTPS ตรงไปยังเกตเวย์เพื่ออ่านเฉพาะตัวเลขโควตาจาก Response Headers เท่านั้น และถูกทำลายจากหน่วยความจำทันที',
      inputLabel: '9ARM Gateway API Key',
      inputPlaceholder: 'วาง API Key ของคุณที่นี่ (เช่น sk-...)',
      checkBtn: 'ตรวจสอบโควตา',
      checkingBtn: 'กำลังตรวจสอบ...',
      clearBtn: 'ล้างข้อมูล',
      curlTab: 'วิธีรัน cURL เองผ่าน Terminal (สำหรับนักพัฒนา)',
      curlDesc: 'หากไม่ต้องการวาง Key บนเบราว์เซอร์ คุณสามารถคัดลอกคำสั่ง cURL ไปรันบน Terminal ของเครื่องตัวเองเพื่อดู Response Headers ได้โดยตรง:',
      curlCopied: 'คัดลอกคำสั่ง cURL แล้ว!',
      copyCurlBtn: 'คัดลอกคำสั่ง cURL',
      resultTitle: 'ผลการตรวจสอบโควตาสำหรับ Key ของคุณ',
      statusValid: 'ใช้งานได้ปกติ (HTTP 200)',
      statusInvalid: 'Key ไม่ถูกต้องหรือหมดอายุ (HTTP 401)',
      statusThrottled: 'ติดขีดจำกัดชั่วคราว (HTTP 429)',
      concurrencyLabel: 'คำขอพร้อมกัน (Concurrency)',
      tpmLabel: 'โควตา Token (TPM)',
      budgetLabel: 'วงเงินสะสมต่อเดือน (Key Budget)',
      latencyLabel: 'เวลาตอบสนอง (Latency)',
      checkedAtLabel: 'ตรวจสอบเมื่อ',
      slotsFree: 'ว่าง {free} จาก {max} ช่อง ({pct}% คงเหลือ)',
      tokenRemaining: 'เหลือ {tokens} จาก {limit} TPM ({pct}% คงเหลือ)',
      budgetRemaining: 'เหลือ ${remaining} จาก ${max} ({pct}% คงเหลือ)',
      emptyInputAlert: 'กรุณากรอก API Key ก่อนกดตรวจสอบ',
      errorPrefix: 'เกิดข้อผิดพลาด:',
    },
    faq: {
      title: 'คำถามที่พบบ่อยเกี่ยวกับโควตา & Rate Limit (FAQ)',
      subtitle: 'รวมคำตอบข้อสงสัยสำหรับสมาชิกชุมชน 9ARM AI PASSPORT และผู้ใช้งานเกตเวย์',
      tagRateLimit: 'Rate Limit (HTTP 429)',
      tagQuota: 'โควตา & วงเงิน',
      tagTransparency: 'ความโปร่งใสของข้อมูล',
      q1Title: 'ติด Error HTTP 429 (Too Many Requests) ต้องทำอย่างไร? ต้องรอกี่วันหรือรอข้ามคืนไหม?',
      q1Answer: 'ไม่ต้องรอเป็นวันครับ! มากกว่า 90% ของกรณีที่เจอเกิดจาก "Concurrency ชนกัน" (ส่งคำขอพร้อมกันเกิน 3 งานในเสี้ยววินาที เช่น Agent รันงานย่อยพร้อมกันหลายหน้าต่าง) วิธีแก้คือรอเพียง 2–5 วินาทีให้คำขอก่อนหน้าตอบเสร็จแล้วกดส่งใหม่ได้ทันที แต่หากเป็นการส่งโค้ดก้อนใหญ่มากๆ รัวๆ ติดต่อกัน ให้รอ 30–60 วินาทีเพื่อให้รอบนาทีรีเซ็ตครับ',
      q2Title: 'สรุปแล้ว Gateway กำหนดระบบ Usage Limit ไว้อย่างไรบ้าง? (ระดับวินาที / นาที / เดือน)',
      q2Answer: 'เกตเวย์แบ่งเกณฑ์จำกัดออกเป็น 3 ระดับอย่างชัดเจน:\n1. Concurrency (ระดับวินาที): จำกัดสูงสุด 3 คำขอพร้อมกันต่อ 1 API Key (สล็อตจะว่างทันทีที่คำขอก่อนหน้าตอบเสร็จ)\n2. Token Limit (ระดับนาที - TPM): สูงสุด 1,000,000 โทเค็นต่อนาที โดยจะรีเซ็ตใหม่ทุกๆ 60 วินาที\n3. Budget Limit (ระดับรอบสมาชิก): วงเงิน $50 ต่อรอบสมาชิกรายเดือน (คิดเป็นประมาณ 50,000,000 โทเค็นต่อเดือน ซึ่งเพียงพอต่อการใช้งานทั่วไปอย่างเหลือเฟือ)',
      q3Title: 'ตัวเลข "คำขอพร้อมกัน 3 คำขอ" หมายถึงทั้งเซิร์ฟเวอร์รับได้แค่นี้หรือเปล่า?',
      q3Answer: 'ไม่ใช่ครับ! ตัวเลข 3 คำขอนี้เป็น "เพดานประจำแต่ละ API Key (Per-Account Tier Cap)" ไม่ใช่ความจุของเครื่องเซิร์ฟเวอร์ เกตเวย์ตั้งเกณฑ์นี้ไว้เพื่อป้องกันไม่ให้มีใครยิงสแปมจนดึง GPU ส่วนรวม ผู้ใช้แต่ละท่านจะมีโควตา 3 คำขอของตนเองแยกกันโดยอิสระครับ',
      q4Title: 'หน้า Status Page รู้ตัวเลขโควตาและงบประมาณเหล่านี้ได้อย่างไร? เป็นข้อมูลลับหลังบ้านหรือไม่?',
      q4Answer: 'ไม่ได้เป็นข้อมูลลับแต่อย่างใดครับ! เกตเวย์ของนายอาร์มขับเคลื่อนด้วย LiteLLM Proxy ซึ่งเป็นระบบมาตรฐานที่ส่งตัวเลขโควตาและสถานะการจำกัดเหล่านี้มาใน "HTTP Response Headers" (เช่น x-ratelimit-api_key-* และ x-litellm-*) ให้กับไคลเอนต์ทุกคนอยู่แล้ว ทุกท่านสามารถตรวจสอบค่านี้ได้ด้วยตนเองผ่าน Network Tab (F12) หรือยิงผ่านคำสั่ง curl ได้เช่นเดียวกันครับ',
    },
    chart: {
      title: 'เวลาตอบสนองและความหน่วง',
      titleWithRange: 'เวลาตอบสนองและความหน่วง ({range})',
      subtitle: 'การวัดความหน่วงของแต่ละบริการอย่างต่อเนื่อง · เลื่อนเมาส์เพื่อดูจุดเวลา หรือคลิกเพื่อคัดลอกข้อมูล',
      allEndpoints: 'ทุกบริการ (แสดงทุกเส้น)',
      noData: 'ไม่มีข้อมูลการวัดความหน่วงในช่วงเวลานี้',
      noData24h: 'ไม่มีข้อมูลการวัดความหน่วงในช่วง 24 ชั่วโมงที่ผ่านมา',
      hoursAgo24: '24 ชม. ที่แล้ว',
      hoursAgo12: '12 ชม. ที่แล้ว',
      now: 'ปัจจุบัน',
      copiedLatency: 'คัดลอกข้อมูลความหน่วง ({ms}ms เมื่อ {time}) แล้ว',
      clickToCopy: 'คลิกเพื่อคัดลอก',
      liveBadge: 'สด (LIVE)',
      updatedJustNow: 'อัปเดตล่าสุด',
      range1h: '1 ชม.',
      range6h: '6 ชม.',
      range24h: '24 ชม.',
      range7d: '7 วัน',
      rangeLabel1h: '1 ชั่วโมงที่ผ่านมา',
      rangeLabel6h: '6 ชั่วโมงที่ผ่านมา',
      rangeLabel24h: '24 ชั่วโมงที่ผ่านมา',
      rangeLabel7d: '7 วันที่ผ่านมา',
      avg: 'เฉลี่ย',
      p95: 'P95',
      min: 'ต่ำสุด',
      max: 'สูงสุด',
      current: 'ล่าสุด',
    },
    announcements: {
      title: 'ประกาศและการเปลี่ยนแปลงระบบ',
      badgeNotice: 'ประกาศสำคัญ',
      badgeModelUpdate: 'อัปเดตโมเดล',
      badgeMaintenance: 'ปิดปรับปรุง',
      badgeFeature: 'ฟีเจอร์ใหม่',
      viewHistoryBtn: 'ประวัติการเปลี่ยนแปลง',
      discordRefBtn: 'ดูประกาศใน Discord',
      dismiss: 'ซ่อนประกาศ',
      showNotice: '📢 ดูประกาศล่าสุด (DeepSeek)',
      latestNoticeTitle: 'โมเดล DeepSeek v4 Flash ยุติช่วงทดสอบชั่วคราว',
      latestNoticeDesc: 'นายอาร์มได้ประกาศสิ้นสุดช่วงทดสอบโมเดล DeepSeek v4 Flash ชั่วคราว และจะกลับมาเปิดใหม่อีกครั้งในเร็วๆ นี้ ระบบสถานะได้หยุดตรวจเช็คโมเดลดังกล่าวชั่วคราวเพื่อป้องกันการแจ้งเตือนผิดพลาด',
      modelOfflineNote: 'โมเดลนี้ออฟไลน์ชั่วคราว (ระบบหยุดการ Ping เพื่อไม่ให้เกิด False Outage)',
    },
    changeHistory: {
      modalTitle: 'ประวัติการเปลี่ยนแปลงและการอัปเดต (Change History)',
      modalSubtitle: 'บันทึกประวัติการเพิ่ม-ลดโมเดล การปรับปรุงประสิทธิภาพ และการอัปเดตระบบ Gateway 9arm',
      allChanges: 'รายการอัปเดตทั้งหมด',
      filterLabel: 'กรองตามประเภท:',
      closeBtn: 'ปิดหน้าต่าง',
      referenceLink: 'ลิงก์อ้างอิงประกาศ',
    },
    pastIncidents: {
      title: 'เหตุขัดข้องที่ผ่านมา',
      zeroIncidents24h: 'ไม่มีเหตุขัดข้องใน 24 ชั่วโมงที่ผ่านมา',
      incidentsCount24h: '{count} เหตุขัดข้องใน 24 ชั่วโมงที่ผ่านมา',
      noIncidentsReported: 'ไม่มีรายงานเหตุขัดข้องในช่วงเวลานี้',
      viewFullHistory: '← ดูประวัติเหตุขัดข้องทั้งหมด',
      prevPeriod: 'ช่วงก่อนหน้า (14 วัน)',
      nextPeriod: 'ช่วงถัดไป (14 วัน)',
      todayBtn: 'ปัจจุบัน (14 วันล่าสุด)',
      pageOf: 'หน้า {current} จาก {total}',
      daysCount: '{count} วัน',
      showMoreIncidents: '+ แสดงเหตุการณ์เพิ่มเติมอีก {count} รายการ (ทั้งหมด {total} รายการ)',
      showFewerIncidents: '- ย่อแสดงเฉพาะ 3 รายการล่าสุด',
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
      operational: 'ใช้งานได้ตามปกติ',
      operational100: 'ใช้งานได้ตามปกติ (100%)',
      operationalWithPct: 'ใช้งานได้ตามปกติ ({pct}%)',
      degraded: 'ประสิทธิภาพลดลง',
      degradedWithPct: 'ประสิทธิภาพลดลง ({pct}%)',
      majorOutage: 'ระบบขัดข้องรุนแรง',
      outageWithPct: 'ระบบขัดข้อง ({pct}%)',
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
      limits: 'Usage & Limits',
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
      rateLimited: 'Usage / Rate Limited',
      quotaExhausted: 'Quota Exhausted',
      quotaTitle: 'Account Tier Limits (Per-Key Cap)',
      remainingTokens: 'Token Quota (TPM)',
      maxConcurrency: 'Max Concurrent / Key',
      keyBudget: 'Key Budget (Monitor Key)',
      tpmTokens: 'TPM Tokens',
      concurrencySlots: 'Parallel Requests',
      concurrencyNotice: 'Gateway enforces a concurrency cap of {max} simultaneous requests per key',
      tpmCapNotice: 'Token volume capped at {limit} tokens per minute (TPM)',
      tierSubtitle: 'Per-account rate limits enforced on each API key via gateway response headers',
    },
    rateLimitBanner: {
      title: 'Usage / Rate Limit Active (HTTP 429)',
      desc: 'The gateway is currently throttling requests (upstream model is operational) because concurrent requests exceeded 3 or token generation surpassed 1M TPM. Please stagger requests and retry shortly.',
      concurrencyInUse: '{inUse} of {total} slots currently processing',
      concurrencyFull: 'Concurrency cap reached (3/3) — subsequent requests will encounter HTTP 429',
      concurrencyAvailable: '{available} concurrency slot(s) available for new requests',
      tokensAvailable: 'Remaining Token Quota in current window',
      budgetUsed: 'Key budget utilized to date',
      viewFaqBtn: 'Understand Limits & Fixes (FAQ) ↓',
    },
    usageLimits: {
      title: 'Usage Quotas & Rate Limits',
      subtitle: 'Real-time telemetry tracking per-key tier caps and quota headroom from gateway response headers',
      allNormal: 'All Quotas Normal — No throttling active',
      throttledNotice: 'Rate Limiting Active (HTTP 429) — Gateway is temporarily throttling requests',
      concurrencyTitle: 'Parallel Requests (Concurrency)',
      concurrencyDesc: 'Real-time in-flight slots (frees up the moment each inference finishes)',
      tokensTitle: 'Tokens Per Minute (TPM)',
      tokensDesc: 'Token volume ceiling per 1-minute window (resets rolling every 60 seconds)',
      budgetTitle: 'Monitor Key Budget',
      budgetDesc: 'Accumulated monthly spend of the monitor testing key ($50/month allocation)',
      remaining: 'Remaining',
      used: 'Used',
      capacity: 'Capacity',
      freeSlots: '{free} of {max} slots free',
      perModelTitle: 'Per-Service & Model Quota Status',
      perModelSubtitle: 'Slot availability and quota headroom breakdown by model endpoint',
      historyTitle: 'Rate Limit Incidents (429 Logs in Past 24h)',
      historySubtitle: 'Incidents where health checks received HTTP 429 in the past 24 hours',
      no429In24h: 'No HTTP 429 rate limit events recorded in the past 24 hours — 100% smooth processing',
      recent429Found: '{count} rate limit event(s) recorded in the past 24 hours',
      colTimestamp: 'Timestamp',
      colEndpoint: 'Service / Model',
      colStatus: 'Status',
      colDetails: 'Throttling Details',
      devTipsTitle: 'Developer Guidelines to Avoid HTTP 429',
      devTipsDesc: 'Use an in-process semaphore or concurrency pool capped at <= 3 parallel requests with exponential backoff (retry after 2–5s) for optimal throughput.',
      quickSwitchFaq: 'Jump to FAQ & Q&A below ↓',
    },
    userQuotaChecker: {
      title: 'Personal API Key Quota Checker',
      subtitle: 'Enter your 9ARM Gateway API Key to check your real-time concurrency slots, TPM token quota headroom, and remaining budget.',
      securityBadge: '100% Zero-Knowledge',
      securityDisclaimer: 'Completely Private: Your API Key is never stored in any database or disk. It is dispatched via encrypted HTTPS purely to query response headers from gateway.9arm.co and immediately discarded from memory.',
      inputLabel: '9ARM Gateway API Key',
      inputPlaceholder: 'Paste your API Key here (e.g. sk-...)',
      checkBtn: 'Check Quota',
      checkingBtn: 'Checking...',
      clearBtn: 'Clear Data',
      curlTab: 'Run via Terminal cURL (For Developers)',
      curlDesc: 'If you prefer not to paste your key into a web interface, copy and run this standard cURL command in your local terminal to inspect headers directly:',
      curlCopied: 'cURL command copied!',
      copyCurlBtn: 'Copy cURL Command',
      resultTitle: 'Quota Telemetry for Your Key',
      statusValid: 'Authorized & Healthy (HTTP 200)',
      statusInvalid: 'Invalid or Expired Key (HTTP 401)',
      statusThrottled: 'Rate Limited (HTTP 429)',
      concurrencyLabel: 'Parallel Requests (Concurrency)',
      tpmLabel: 'Tokens Per Minute (TPM)',
      budgetLabel: 'Monthly Key Budget',
      latencyLabel: 'Response Latency',
      checkedAtLabel: 'Checked At',
      slotsFree: '{free} of {max} slots free ({pct}% remaining)',
      tokenRemaining: '{tokens} of {limit} TPM remaining ({pct}% remaining)',
      budgetRemaining: '${remaining} of ${max} remaining ({pct}% remaining)',
      emptyInputAlert: 'Please enter an API Key before checking',
      errorPrefix: 'Error:',
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      subtitle: 'Clear answers on Gateway Rate Limits, Concurrency, and Token Quotas for community members',
      tagRateLimit: 'Rate Limit (HTTP 429)',
      tagQuota: 'Quotas & Budget',
      tagTransparency: 'Data Transparency',
      q1Title: 'Encountered HTTP 429 (Too Many Requests)? Do I have to wait a day or overnight?',
      q1Answer: 'No, you do not have to wait a day! Over 90% of 429 errors are due to instantaneous concurrency overlap (more than 3 simultaneous requests in flight at the exact same split-second, e.g. parallel IDE agents). Simply wait 2–5 seconds for preceding requests to finish and retry. If you streamed multiple massive prompts consecutively, wait 30–60 seconds for the 1-minute window to reset.',
      q2Title: 'What are the exact usage limits enforced on the gateway? (Second, Minute, Monthly)',
      q2Answer: 'Limits are structured across 3 distinct tiers:\n1. Concurrency (Real-time): Maximum 3 simultaneous requests per API Key (slots free up the moment previous responses complete).\n2. Token Volume (Per-Minute - TPM): Capped at 1,000,000 tokens per minute, resetting every 60 seconds.\n3. Key Budget (Per-Month): $50 allocated per 9ARM AI PASSPORT subscription period (~50 million tokens/month, which is extraordinarily generous for development workflows).',
      q3Title: 'Does "3 Max Concurrent Requests" mean the entire server only supports 3 users globally?',
      q3Answer: 'No! The 3-request limit is an individual Per-Account Tier Cap enforced per API key to prevent any single automated tool from monopolizing GPU clusters. Each user/key has their own independent 3-concurrency allocation.',
      q4Title: 'How does this Status Page obtain these quota numbers? Is this private internal data?',
      q4Answer: 'Not private at all! The gateway runs LiteLLM Proxy, which by industry standard injects rate limit and key budget telemetry directly into public HTTP Response Headers (e.g. x-ratelimit-api_key-* and x-litellm-*). Any developer can inspect these exact headers in Chrome DevTools (F12) or via curl -I.',
    },
    chart: {
      title: 'Response Time & Latency',
      titleWithRange: 'Response Time & Latency ({range})',
      subtitle: 'Continuous multi-service latency measurements · Hover to scrub points, click to copy diagnostic data',
      allEndpoints: 'All Endpoints (Multi-line)',
      noData: 'No latency measurements recorded for this time range.',
      noData24h: 'No latency measurements recorded in the last 24 hours.',
      hoursAgo24: '24h ago',
      hoursAgo12: '12h ago',
      now: 'Now',
      copiedLatency: 'Copied latency data ({ms}ms at {time})',
      clickToCopy: 'Click to copy',
      liveBadge: 'LIVE',
      updatedJustNow: 'Updated just now',
      range1h: '1h',
      range6h: '6h',
      range24h: '24h',
      range7d: '7d',
      rangeLabel1h: 'Last 1 Hour',
      rangeLabel6h: 'Last 6 Hours',
      rangeLabel24h: 'Last 24 Hours',
      rangeLabel7d: 'Last 7 Days',
      avg: 'Avg',
      p95: 'P95',
      min: 'Min',
      max: 'Max',
      current: 'Current',
    },
    announcements: {
      title: 'System Announcements & Updates',
      badgeNotice: 'Notice',
      badgeModelUpdate: 'Model Update',
      badgeMaintenance: 'Maintenance',
      badgeFeature: 'New Feature',
      viewHistoryBtn: 'Change History',
      discordRefBtn: 'View Discord Announcement',
      dismiss: 'Dismiss',
      showNotice: '📢 View Latest Announcement (DeepSeek)',
      latestNoticeTitle: 'DeepSeek v4 Flash Testing Phase Concluded',
      latestNoticeDesc: '9arm announced that the DeepSeek v4 Flash testing period has concluded and is temporarily offline. Automated health checks for this model are paused to prevent false downtime alarms until it returns.',
      modelOfflineNote: 'Model is temporarily offline (health check pings paused to prevent false outage alerts)',
    },
    changeHistory: {
      modalTitle: 'Change History & System Updates',
      modalSubtitle: 'Complete timeline of model availability, infrastructure changes, and gateway announcements',
      allChanges: 'All System Changes',
      filterLabel: 'Filter by category:',
      closeBtn: 'Close',
      referenceLink: 'Official Reference',
    },
    pastIncidents: {
      title: 'Past Incidents',
      zeroIncidents24h: '0 incidents in past 24 hours',
      incidentsCount24h: '{count} incident{s} in past 24 hours',
      noIncidentsReported: 'No incidents reported in this period.',
      viewFullHistory: '← View full incident history',
      prevPeriod: 'Previous (14 days)',
      nextPeriod: 'Next (14 days)',
      todayBtn: 'Today (Latest 14 days)',
      pageOf: 'Page {current} of {total}',
      daysCount: '{count} days',
      showMoreIncidents: '+ Show {count} more incidents (Total {total})',
      showFewerIncidents: '- Show fewer incidents',
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
      operational: 'Operational',
      operational100: 'Operational (100%)',
      operationalWithPct: 'Operational ({pct}%)',
      degraded: 'Degraded performance',
      degradedWithPct: 'Degraded performance ({pct}%)',
      majorOutage: 'Major outage',
      outageWithPct: 'Major outage ({pct}%)',
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
