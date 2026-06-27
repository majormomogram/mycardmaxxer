/**
 * Static Malaysian credit card database — Phase 1.
 * Data sourced from official bank pages + RinggitPlus/iMoney cross-checks (June 2026).
 *
 * @typedef {Object} Benefit
 * @property {string} id
 * @property {string} category          - matches CATEGORIES.id
 * @property {"cashback"|"points"} type
 * @property {number} rate
 * @property {"percent"|"points_per_rm"} unit
 * @property {number|null} monthlyCap   - MYR spend cap above which rate does not apply
 * @property {number|null} cashbackCap  - max cashback/points per period in MYR
 * @property {number|null} minimumSpend - monthly minimum spend required to unlock this rate
 * @property {string} conditions
 * @property {"myr"|"transactions"|null} trackingUnit
 * @property {"monthly"|"annual"|"card_anniversary"|"never"} resetCadence
 * @property {number|null} threshold
 * @property {"max_benefit_cap"|"unlock_requirement"|null} thresholdType
 *
 * @typedef {Object} Perk
 * @property {string} id
 * @property {string} name
 * @property {"lounge"|"golf"|"dining_credit"|"voucher"|"cashback_credit"|"concierge"|"other"} type
 * @property {"annual"|"monthly"|"quarterly"} frequency
 * @property {number} quantity
 * @property {number|null} estimatedValue
 * @property {string} description
 * @property {string} notes
 *
 * @typedef {Object} InsuranceCoverage
 * @property {"travel"|"purchase_protection"|"extended_warranty"|"personal_accident"|"medical"|"other"} type
 * @property {string} name
 * @property {number|null} coverageAmount
 * @property {"MYR"|"USD"|null} currency
 * @property {string} conditions
 * @property {string} description
 *
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} bankId
 * @property {string} bank
 * @property {string} cardName
 * @property {"Visa"|"Mastercard"|"Amex"} network
 * @property {number} annualFee
 * @property {string|null} feeWaiverCondition
 * @property {Benefit[]} benefits
 * @property {Perk[]} perks
 * @property {InsuranceCoverage[]} insurance
 * @property {string} notes
 * @property {string} lastVerified
 * @property {"verified"|"unverified"} dataConfidence
 * @property {string} sourceUrl
 */

/** @type {Card[]} */
export const CARDS = [
  {
    id: 'alliance-visa-infinite',
    bankId: 'alliance',
    bank: 'Alliance Bank',
    cardName: 'Visa Infinite',
    network: 'Visa',
    annualFee: 438,
    feeWaiverCondition: 'Year 1 waived. Year 2+: annual spend of RM120,000 (also unlocks unlimited lounge access).',
    benefits: [
      {
        id: 'allinf-overseas',
        category: 'overseas',
        type: 'points',
        rate: 10,
        unit: 'points_per_rm',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Overseas retail only. Excludes online purchases.',
        trackingUnit: null,
        resetCadence: 'never',
        threshold: null,
        thresholdType: null,
      },
      {
        id: 'allinf-general',
        category: 'general',
        type: 'points',
        rate: 1,
        unit: 'points_per_rm',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Base rate on all domestic retail.',
        trackingUnit: null,
        resetCadence: 'never',
        threshold: null,
        thresholdType: null,
      },
      {
        id: 'allinf-feewaiver',
        category: 'general',
        type: 'cashback',
        rate: 0,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Track annual spend toward RM120,000 fee waiver + unlimited lounge unlock.',
        trackingUnit: 'myr',
        resetCadence: 'card_anniversary',
        threshold: 120000,
        thresholdType: 'unlock_requirement',
      },
    ],
    perks: [
      {
        id: 'allinf-lounge-pp',
        name: 'Plaza Premium Lounge (Worldwide)',
        type: 'lounge',
        frequency: 'annual',
        quantity: 2,
        estimatedValue: 150,
        description: 'Year 1: 2 visits. Year 2+: unlimited if RM120k annual spend met.',
        notes: 'Visit count is per card year, not calendar year.',
      },
      {
        id: 'allinf-lounge-travelclub',
        name: 'Travel Club Lounge (Malaysia)',
        type: 'lounge',
        frequency: 'annual',
        quantity: 1,
        estimatedValue: 100,
        description: 'Year 1: 1 visit. Year 2+: unlimited if RM120k annual spend met.',
        notes: '',
      },
      {
        id: 'allinf-concierge',
        name: 'Visa Infinite Concierge',
        type: 'concierge',
        frequency: 'annual',
        quantity: 999,
        estimatedValue: null,
        description: '24/7 concierge for travel, dining, entertainment bookings.',
        notes: '',
      },
    ],
    insurance: [
      {
        type: 'travel',
        name: 'Complimentary Travel Insurance',
        coverageAmount: null,
        currency: 'MYR',
        conditions: 'Unverified — confirm coverage amount against latest product disclosure sheet.',
        description: 'Visa Infinite typically carries travel insurance but consumer card amount not confirmed on public pages.',
      },
    ],
    notes: 'Rewards as TBP points convertible to airline miles (Enrich, Asia Miles, KrisFlyer, BIG). 3-year point validity.',
    lastVerified: '2026-06-23',
    dataConfidence: 'verified',
    sourceUrl: 'https://www.alliancebank.com.my/personal/Cards/Credit-Cards/Visa-Infinite-Credit-Card',
    defaultPointsToMyrRatio: 0.001667,
    pointsRatioBasis: '60,000 TBP = RM100 AEON / Giant / Lotus / Mydin / TNG eWallet voucher',
    pointsRatioSourceUrl: 'https://www.alliancebank.com.my/rewards',
    pointsRatioVerifiedAt: '2026-06-24',
  },
  {
    id: 'uob-one-classic',
    bankId: 'uob',
    bank: 'UOB',
    cardName: 'One Card Classic',
    network: 'Visa',
    annualFee: 120,
    feeWaiverCondition: 'Spend RM15,000 within 12-month period before fee due date.',
    benefits: [
      {
        id: 'uob1-petrol',
        category: 'petrol',
        type: 'cashback',
        rate: 10,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: 15,
        minimumSpend: 800,
        conditions: '10% only if min RM800 total monthly spend met (existing-holder threshold; else 0.2% base). Cap RM15/month.',
        trackingUnit: 'myr',
        resetCadence: 'monthly',
        threshold: 150,
        thresholdType: 'max_benefit_cap',
      },
      {
        id: 'uob1-groceries',
        category: 'groceries',
        type: 'cashback',
        rate: 10,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: 15,
        minimumSpend: 800,
        conditions: '10% only if min RM800 total monthly spend met (existing-holder threshold; else 0.2% base). Cap RM15/month.',
        trackingUnit: 'myr',
        resetCadence: 'monthly',
        threshold: 150,
        thresholdType: 'max_benefit_cap',
      },
      {
        id: 'uob1-dining',
        category: 'dining',
        type: 'cashback',
        rate: 10,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: 200,
        minimumSpend: 800,
        conditions: '10% only if min RM800 total monthly spend met (existing-holder threshold; else 0.2% base). Cap RM200/month.',
        trackingUnit: 'myr',
        resetCadence: 'monthly',
        threshold: 2000,
        thresholdType: 'max_benefit_cap',
      },
      {
        id: 'uob1-grab',
        category: 'grab',
        type: 'cashback',
        rate: 10,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: 10,
        minimumSpend: 800,
        conditions: '10% only if min RM800 total monthly spend met (existing-holder threshold; else 0.2% base). Cap RM10/month.',
        trackingUnit: 'myr',
        resetCadence: 'monthly',
        threshold: 100,
        thresholdType: 'max_benefit_cap',
      },
      {
        id: 'uob1-minspend',
        category: 'general',
        type: 'cashback',
        rate: 0.2,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Track total monthly spend toward RM800 threshold to unlock 10% tier on petrol/groceries/dining/Grab.',
        trackingUnit: 'myr',
        resetCadence: 'monthly',
        threshold: 800,
        thresholdType: 'unlock_requirement',
      },
      {
        id: 'uob1-feewaiver',
        category: 'general',
        type: 'cashback',
        rate: 0,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Track annual spend toward RM15,000 fee waiver.',
        trackingUnit: 'myr',
        resetCadence: 'card_anniversary',
        threshold: 15000,
        thresholdType: 'unlock_requirement',
      },
    ],
    perks: [],
    insurance: [],
    notes: 'Card discontinued for new applicants as of 2026 — existing holders retain benefits. UOB now promotes the Platinum variant.',
    lastVerified: '2026-06-23',
    dataConfidence: 'unverified',
    sourceUrl: 'https://www.uob.com.my/personal/cards/credit-cards/uob-one-card.page',
  },
  {
    id: 'ambank-visa-signature',
    bankId: 'ambank',
    bank: 'AmBank',
    cardName: 'Visa Signature',
    network: 'Visa',
    annualFee: 0,
    feeWaiverCondition: 'Lifetime free for principal cardholder. First 3 supplementary free; 4th onwards RM188/year each.',
    benefits: [
      {
        id: 'ambvs-overseas',
        category: 'overseas',
        type: 'points',
        rate: 3,
        unit: 'points_per_rm',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Overseas retail (non-online) only.',
        trackingUnit: null,
        resetCadence: 'never',
        threshold: null,
        thresholdType: null,
      },
      {
        id: 'ambvs-general',
        category: 'general',
        type: 'points',
        rate: 1,
        unit: 'points_per_rm',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Base rate on local retail and online.',
        trackingUnit: null,
        resetCadence: 'never',
        threshold: null,
        thresholdType: null,
      },
      {
        id: 'ambvs-lounge-spend',
        category: 'general',
        type: 'cashback',
        rate: 0,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: 1000,
        conditions: 'Track monthly spend toward RM1,000 to unlock each lounge visit.',
        trackingUnit: 'myr',
        resetCadence: 'monthly',
        threshold: 1000,
        thresholdType: 'unlock_requirement',
      },
      {
        id: 'ambvs-hilton-spend',
        category: 'general',
        type: 'cashback',
        rate: 0,
        unit: 'percent',
        monthlyCap: null,
        cashbackCap: null,
        minimumSpend: null,
        conditions: 'Track annual spend toward RM30,000 to unlock Hilton Premium Club membership.',
        trackingUnit: 'myr',
        resetCadence: 'card_anniversary',
        threshold: 30000,
        thresholdType: 'unlock_requirement',
      },
    ],
    perks: [
      {
        id: 'ambvs-lounge',
        name: 'Plaza Premium Lounge (Worldwide)',
        type: 'lounge',
        frequency: 'annual',
        quantity: 6,
        estimatedValue: 150,
        description: '6 complimentary visits per year. Requires RM1,000 monthly spend before each visit.',
        notes: 'Per card year. Monthly spend requirement tracked separately.',
      },
      {
        id: 'ambvs-tableapp',
        name: 'TableApp Elite Membership',
        type: 'dining_credit',
        frequency: 'annual',
        quantity: 1,
        estimatedValue: null,
        description: '1-year complimentary — free dish per restaurant visit at participating venues.',
        notes: '',
      },
      {
        id: 'ambvs-clubmarriott',
        name: 'Club Marriott Membership',
        type: 'dining_credit',
        frequency: 'annual',
        quantity: 1,
        estimatedValue: null,
        description: 'Annual membership: up to 50% off dining/accommodation at Marriott properties.',
        notes: '',
      },
      {
        id: 'ambvs-hilton',
        name: 'Hilton Premium Club',
        type: 'dining_credit',
        frequency: 'annual',
        quantity: 1,
        estimatedValue: null,
        description: 'Available with RM30,000 annual spend. Best available rates + dining discounts.',
        notes: 'Spend threshold gate — track separately.',
      },
      {
        id: 'ambvs-golf',
        name: 'Golf Green Fee Discounts',
        type: 'golf',
        frequency: 'annual',
        quantity: 999,
        estimatedValue: null,
        description: 'Discounts at selected Malaysian golf clubs.',
        notes: '',
      },
    ],
    insurance: [
      {
        type: 'travel',
        name: 'Travel Insurance — Principal & Spouse',
        coverageAmount: 1000000,
        currency: 'MYR',
        conditions: 'Full plane ticket must be charged to card.',
        description: 'RM1,000,000 travel insurance for cardholder and spouse.',
      },
      {
        type: 'travel',
        name: 'Travel Insurance — Children',
        coverageAmount: 250000,
        currency: 'MYR',
        conditions: 'Full plane ticket must be charged to card.',
        description: 'RM250,000 travel insurance for dependent children.',
      },
      {
        type: 'travel',
        name: 'Flight Delay/Missed Connection',
        coverageAmount: 800,
        currency: 'MYR',
        conditions: 'Per incident. Charged ticket required.',
        description: 'RM800 per incident for delayed or missed flights.',
      },
      {
        type: 'travel',
        name: 'Luggage Coverage',
        coverageAmount: 1600,
        currency: 'MYR',
        conditions: 'Lost luggage RM1,600 / delayed RM800.',
        description: 'Compensation for lost or delayed luggage.',
      },
    ],
    notes: 'AmBonus Points convertible to airline miles, gift vouchers, or cash redemption. 3-year point validity.',
    lastVerified: '2026-06-23',
    dataConfidence: 'verified',
    sourceUrl: 'https://www.ambank.com.my/cards/credit-cards',
    defaultPointsToMyrRatio: 0.001667,
    pointsRatioBasis: '60,000 AmBonus = RM100 grocery / Mydin / TNG voucher (90,000 = RM100 cash rebate is less generous)',
    pointsRatioSourceUrl: 'https://www.ambank.com.my/promotions/AmBonus-Rewards-Campaign',
    pointsRatioVerifiedAt: '2026-06-24',
  },
]

export const cardById = (id) => CARDS.find(c => c.id === id)
