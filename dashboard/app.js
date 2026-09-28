/**
 * IDR-NAV — Primary Navigation Product & Engineering Dashboard Logic
 * Pure Vanilla JavaScript — Zero build step, zero CORS risk.
 *
 * Primary Product Flow:
 *   1. Destination Selection (Pune, Maharashtra, India)
 *   2. Route Preview (~24 min, 8.6 km, Arrive 12:14 PM)
 *   3. Live Navigation Simulation:
 *      - Moving 3D Navigation Arrow with directional rotation & camera tracking
 *      - Live HUD turn-by-turn guidance and dynamic dock countdowns
 *      - Real-time GNSS outage handoff (SIMULATED OUTAGE — DEMONSTRATION)
 *      - Dead-reckoning continuation and GNSS recovery
 *      - Clean destination arrival
 *
 * Secondary Tabs:
 *   - System Evidence: Preserves all Phase 1–3 engineering calculations & canvases
 *   - Diagnostics: Verified hardware rates & Rodrigues alignment matrix
 */

(function () {
  'use strict';

  // ============================================================================
  // 1. PROTOTYPE PUNE ROUTES CONFIGURATION
  // ============================================================================
  const PUNE_ROUTES = {
    'pune-airport': {
      id: 'pune-airport',
      name: 'Pune Airport (Lohegaon)',
      departure: 'Shivajinagar, Pune',
      corridor: 'From Shivajinagar via Sangamwadi & Nagar Road Corridor',
      distKm: 8.6,
      durationMin: 24,
      arrivalDeterministic: '12:14 PM',
      datasetSource: 'S-Vta1a',
      arrivalName: 'Pune Airport Terminal 1',
      sectors: [
        {
          title: 'Sector 1: Departure via Sancheti Flyover & Sangamwadi Rd',
          desc: 'Open-sky multi-constellation GNSS lock active. Inertial baseline steady.'
        },
        {
          title: 'Sector 2: Nagar Road Underpass Corridor (GNSS Outage Demo)',
          desc: 'Test seamless transition to inertial dead reckoning via SIMULATE GNSS OUTAGE.'
        },
        {
          title: 'Sector 3: Airport Road Approach & Terminal 1 Loop',
          desc: 'Satellite signal reacquisition and multi-sensor fusion re-engagement.'
        }
      ],
      instructionCues: [
        { pct: 0.00, dist: 'In 400m', title: 'Keep right on Sancheti Hospital Flyover', sub: 'Pune Airport Corridor · Continuous Inertial Monitoring Active', icon: '⬆' },
        { pct: 0.16, dist: 'In 800m', title: 'Continue onto Sangamwadi Road', sub: 'Mula-Mutha River Overpass · Ground Truth Reference Active', icon: '↗' },
        { pct: 0.35, dist: 'In 500m', title: 'Merge onto Nagar Road Arterial Corridor', sub: 'Approaching Underpass Sector · Inertial Alignment Checked', icon: '⬆' },
        { pct: 0.52, dist: 'In 1.1km', title: 'Continue straight through Nagar Road Underpass', sub: 'Simulated Outage Demonstration Zone · Dead Reckoning Active', icon: '⬆' },
        { pct: 0.72, dist: 'In 600m', title: 'Turn left onto Airport Road at Gunjan Chowk', sub: 'GNSS Signal Reacquired · Multi-sensor fusion locked', icon: '↰' },
        { pct: 0.88, dist: 'In 250m', title: 'Keep right towards Departure Terminal 1 Loop', sub: 'Approaching Lohegaon Airport Concourse', icon: '↗' },
        { pct: 0.98, dist: 'Arrived', title: 'You have arrived at Pune Airport', sub: 'Terminal 1 Departures · Trip Completed', icon: '🏁' }
      ]
    },
    'viman-nagar': {
      id: 'viman-nagar',
      name: 'Viman Nagar (Symbiosis Hub)',
      departure: 'FC Road, Shivajinagar',
      corridor: 'From FC Road via Bund Garden & Koregaon Park North',
      distKm: 9.2,
      durationMin: 26,
      arrivalDeterministic: '12:16 PM',
      datasetSource: 'S-Vta2',
      arrivalName: 'Viman Nagar Symbiosis Hub',
      sectors: [
        {
          title: 'Sector 1: FC Road onto Bund Garden Bridge',
          desc: 'Dense urban boulevard with elevated metro overhead.'
        },
        {
          title: 'Sector 2: Koregaon Park North Cutoff (GNSS Outage Demo)',
          desc: 'Tree canopy and rail underbridge GNSS denial simulation.'
        },
        {
          title: 'Sector 3: Symbiosis Road Approach',
          desc: 'Full GNSS reacquisition and route completion.'
        }
      ],
      instructionCues: [
        { pct: 0.00, dist: 'In 350m', title: 'Head east on Fergusson College Road', sub: 'Urban arterial corridor · Inertial alignment locked', icon: '⬆' },
        { pct: 0.22, dist: 'In 750m', title: 'Cross Bund Garden Bridge over Mula-Mutha', sub: 'Open sky satellite tracking active', icon: '↗' },
        { pct: 0.45, dist: 'In 400m', title: 'Pass Koregaon Park North Underpass', sub: 'Outage sector test · Dead reckoning propagation', icon: '⬆' },
        { pct: 0.75, dist: 'In 550m', title: 'Turn right onto Symbiosis Road', sub: 'Viman Nagar IT Corridor', icon: '↱' },
        { pct: 0.98, dist: 'Arrived', title: 'You have arrived at Viman Nagar Hub', sub: 'Destination reached successfully', icon: '🏁' }
      ]
    },
    'pune-station': {
      id: 'pune-station',
      name: 'Pune Railway Station',
      departure: 'Shivajinagar, Pune',
      corridor: 'From Shivajinagar via Sangam Bridge & Sassoon Rd',
      distKm: 4.2,
      durationMin: 14,
      arrivalDeterministic: '12:04 PM',
      datasetSource: 'S-Vta1a',
      arrivalName: 'Pune Central Railway Station',
      sectors: [
        {
          title: 'Sector 1: Shivajinagar Court Flyover Approach',
          desc: 'Arterial bridge transition with open sky tracking.'
        },
        {
          title: 'Sector 2: Sangam Bridge Rail Underpass (GNSS Outage Demo)',
          desc: 'Multi-track overhead steel bridge GNSS blockage simulation.'
        },
        {
          title: 'Sector 3: Station Drop-Off Concourse',
          desc: 'Recovery and final passenger drop-off approach.'
        }
      ],
      instructionCues: [
        { pct: 0.00, dist: 'In 250m', title: 'Depart Shivajinagar Court Road', sub: 'Heading towards Sangam Bridge', icon: '⬆' },
        { pct: 0.30, dist: 'In 500m', title: 'Cross Sangam Bridge Rail Overpass', sub: 'Rail infrastructure corridor', icon: '↗' },
        { pct: 0.60, dist: 'In 300m', title: 'Enter Sassoon Hospital Road Underpass', sub: 'Outage sector · Dead reckoning active', icon: '⬆' },
        { pct: 0.85, dist: 'In 200m', title: 'Turn left into Railway Station Concourse', sub: 'Main Passenger Drop-Off', icon: '↰' },
        { pct: 0.98, dist: 'Arrived', title: 'You have arrived at Pune Railway Station', sub: 'Platform 1 Portico · Trip Complete', icon: '🏁' }
      ]
    },
    'hinjawadi': {
      id: 'hinjawadi',
      name: 'Hinjawadi IT Park (Phase 1)',
      departure: 'Pune University Circle',
      corridor: 'From Pune University Circle via Aundh & Wakad Flyover',
      distKm: 17.4,
      durationMin: 42,
      arrivalDeterministic: '12:32 PM',
      datasetSource: 'S-Vta2',
      arrivalName: 'Hinjawadi Phase 1 Campus',
      sectors: [
        {
          title: 'Sector 1: University Circle onto Aundh Road',
          desc: 'Multi-lane arterial link with high satellite visibility.'
        },
        {
          title: 'Sector 2: Wakad Expressway Underpass (GNSS Outage Demo)',
          desc: 'Grade-separated interchange GNSS shadowing demonstration.'
        },
        {
          title: 'Sector 3: Rajiv Gandhi Infotech Park Phase 1 Loop',
          desc: 'Dead reckoning handoff back to dual-frequency GNSS.'
        }
      ],
      instructionCues: [
        { pct: 0.00, dist: 'In 600m', title: 'Take second exit at University Circle onto Aundh Rd', sub: 'West Pune Expressway link', icon: '⟳' },
        { pct: 0.35, dist: 'In 1.5km', title: 'Continue on Wakad Bypass Flyover', sub: 'High-speed corridor (~70 km/h)', icon: '⬆' },
        { pct: 0.65, dist: 'In 400m', title: 'Pass through Wakad Expressway Tunnel', sub: 'Simulated Outage Demonstration Zone', icon: '⬆' },
        { pct: 0.85, dist: 'In 800m', title: 'Merge onto Hinjawadi Phase 1 Spine Road', sub: 'Tech campus perimeter', icon: '↗' },
        { pct: 0.98, dist: 'Arrived', title: 'You have arrived at Hinjawadi IT Park', sub: 'Phase 1 Hub · Trip Complete', icon: '🏁' }
      ]
    }
  };

  // ============================================================================
  // 2. GLOBAL APPLICATION STATE
  // ============================================================================
  const state = {
    activeTab: 'navigation', // 'navigation' | 'evidence' | 'diagnostics'
    dataset: 'S-Vta1a',
    scaleMode: 'full', // 'full' or 'zoom'
    layers: {
      gt: true,
      p2: true,
      p3: true
    },
    gnssOutage: false,
    hoveredIndex: -1,
    toastTimer: null
  };

  // Product Navigation State
  const navState = {
    currentRouteId: 'pune-airport',
    flowStep: 'destination', // 'destination' | 'preview' | 'navigating'
    index: 0,
    isPlaying: false,
    speedMultiplier: 2,
    playTimer: null,
    outageStartIdx: -1,
    isArrived: false
  };

  let dbData = null;

  // ============================================================================
  // 3. CACHED DOM ELEMENTS
  // ============================================================================
  const dom = {
    // App View Switcher
    viewNavigation: document.getElementById('view-navigation'),
    viewEvidence: document.getElementById('view-evidence'),
    viewDiagnostics: document.getElementById('view-diagnostics'),
    tabNavBtn: document.getElementById('tab-nav-btn'),
    tabEvidenceBtn: document.getElementById('tab-evidence-btn'),
    tabDiagnosticsBtn: document.getElementById('tab-diagnostics-btn'),

    // Top Navigation Controls
    gnssBadge: document.getElementById('gnss-status-badge'),
    gnssStatusText: document.getElementById('gnss-status-text'),
    btnQuickOutage: document.getElementById('btn-quick-outage'),
    quickOutageText: document.getElementById('quick-outage-text'),

    // Alert Toast
    toast: document.getElementById('gnss-alert-toast'),
    toastIcon: document.getElementById('toast-icon'),
    toastTitle: document.getElementById('toast-title'),
    toastDesc: document.getElementById('toast-desc'),

    // Primary Navigation Screen Elements
    currentLocationText: document.getElementById('current-location-text'),
    stepBtnDest: document.getElementById('step-btn-dest'),
    stepBtnPreview: document.getElementById('step-btn-preview'),
    stepBtnNav: document.getElementById('step-btn-nav'),
    canvasNavMap: document.getElementById('nav-map-canvas'),
    navMapViewport: document.getElementById('nav-map-viewport'),

    // Flow Overlays
    flowViewDest: document.getElementById('flow-view-destination'),
    flowViewPreview: document.getElementById('flow-view-preview'),

    // Destination Cards
    destCardAirport: document.getElementById('dest-card-pune-airport'),
    destCardViman: document.getElementById('dest-card-viman-nagar'),
    destCardStation: document.getElementById('dest-card-pune-station'),
    destCardHinjawadi: document.getElementById('dest-card-hinjawadi'),

    // Preview Elements
    previewRouteTitle: document.getElementById('preview-route-title'),
    previewCorridorDesc: document.getElementById('preview-corridor-desc'),
    previewDistVal: document.getElementById('preview-dist-val'),
    previewTimeVal: document.getElementById('preview-time-val'),
    previewArrivalVal: document.getElementById('preview-arrival-val'),
    previewSector1Title: document.getElementById('preview-sector-1-title'),
    previewSector1Desc: document.getElementById('preview-sector-1-desc'),
    previewSector2Title: document.getElementById('preview-sector-2-title'),
    previewSector2Desc: document.getElementById('preview-sector-2-desc'),
    previewSector3Title: document.getElementById('preview-sector-3-title'),
    previewSector3Desc: document.getElementById('preview-sector-3-desc'),

    // Live HUD Overlays
    navInstructionCard: document.getElementById('nav-instruction-card'),
    instructionIcon: document.getElementById('instruction-icon'),
    instructionDist: document.getElementById('instruction-dist'),
    instructionTitle: document.getElementById('instruction-title'),
    instructionSub: document.getElementById('instruction-sub'),

    compassArrowWrap: document.getElementById('compass-arrow-wrap'),
    compassBearingReadout: document.getElementById('compass-bearing-readout'),

    navBottomCard: document.getElementById('nav-bottom-card'),
    dockTimeRemaining: document.getElementById('dock-time-remaining'),
    dockDistRemaining: document.getElementById('dock-dist-remaining'),
    dockArriveTime: document.getElementById('dock-arrive-time'),
    dockDistTravelled: document.getElementById('dock-dist-travelled'),
    navSpeedDisplay: document.getElementById('nav-speed-display'),
    hudModeDot: document.getElementById('hud-mode-dot'),
    hudModeTitle: document.getElementById('hud-mode-title'),
    hudOutageAlert: document.getElementById('hud-outage-alert'),
    btnDockOutage: document.getElementById('btn-dock-outage'),
    dockOutageText: document.getElementById('dock-outage-text'),
    btnDockPause: document.getElementById('btn-dock-pause'),
    dockPauseIcon: document.getElementById('dock-pause-icon'),

    // Destination Reached Card
    navArrivalCard: document.getElementById('nav-arrival-card'),
    arrivalTitle: document.getElementById('arrival-title'),
    arrivalDesc: document.getElementById('arrival-desc'),

    // System Evidence Elements (Preserved)
    btnVta1a: document.getElementById('btn-vta1a'),
    btnVta2: document.getElementById('btn-vta2'),
    heroDatasetName: document.getElementById('hero-dataset-name'),
    heroDatasetDesc: document.getElementById('hero-dataset-desc'),
    valDistance: document.getElementById('val-distance'),
    valDuration: document.getElementById('val-duration'),
    valSamples: document.getElementById('val-samples'),
    valPeakSpeed: document.getElementById('val-peak-speed'),
    valMeanSpeed: document.getElementById('val-mean-speed'),
    valDriftPct: document.getElementById('val-drift-pct'),
    captionDist: document.getElementById('caption-dist'),
    captionErr: document.getElementById('caption-err'),
    captionTime: document.getElementById('caption-time'),
    p2FinalErr: document.getElementById('p2-final-err'),
    p2Rmse: document.getElementById('p2-rmse'),
    p2Drift: document.getElementById('p2-drift'),
    p3FinalErr: document.getElementById('p3-final-err'),
    p3Rmse: document.getElementById('p3-rmse'),
    p3Drift: document.getElementById('p3-drift'),
    valDelta: document.getElementById('val-delta'),
    btnScaleFull: document.getElementById('btn-scale-full'),
    btnScaleZoom: document.getElementById('btn-scale-zoom'),
    canvasTrajectory: document.getElementById('trajectory-canvas'),
    canvasDrift: document.getElementById('drift-canvas'),
    tooltip: document.getElementById('canvas-tooltip')
  };

  // ============================================================================
  // 4. INITIALIZATION & DATA RESOLUTION
  // ============================================================================
  function init() {
    if (window.IDR_DATA) {
      dbData = window.IDR_DATA;
      setupApplication();
    } else {
      fetch('data/dashboard_data.json')
        .then((res) => res.json())
        .then((data) => {
          dbData = data;
          setupApplication();
        })
        .catch((err) => {
          console.error('Failed to load dashboard data JSON:', err);
        });
    }

    // Resize handling for canvases
    window.addEventListener('resize', debounce(() => {
      if (state.activeTab === 'navigation') {
        renderNavMap();
      } else if (state.activeTab === 'evidence') {
        renderTrajectory();
        renderDriftChart();
      }
    }, 150));

    setupCanvasHover();
  }

  function setupApplication() {
    // 1. Navigation is the primary default experience
    switchAppTab('navigation');
    selectPuneRoute('pune-airport');
    setFlowStep('destination');

    // 2. Prepare System Evidence data
    updateMetricsUI();
    renderTrajectory();
    renderDriftChart();
  }

  // ============================================================================
  // 5. APPLICATION TAB SWITCHER (Navigation | System Evidence | Diagnostics)
  // ============================================================================
  window.switchAppTab = function (tabName) {
    state.activeTab = tabName;

    // Manage tab buttons
    if (dom.tabNavBtn) dom.tabNavBtn.classList.toggle('active', tabName === 'navigation');
    if (dom.tabEvidenceBtn) dom.tabEvidenceBtn.classList.toggle('active', tabName === 'evidence');
    if (dom.tabDiagnosticsBtn) dom.tabDiagnosticsBtn.classList.toggle('active', tabName === 'diagnostics');

    // Manage views
    if (dom.viewNavigation) {
      dom.viewNavigation.classList.toggle('hidden', tabName !== 'navigation');
      dom.viewNavigation.classList.toggle('active', tabName === 'navigation');
    }
    if (dom.viewEvidence) {
      dom.viewEvidence.classList.toggle('hidden', tabName !== 'evidence');
      dom.viewEvidence.classList.toggle('active', tabName === 'evidence');
    }
    if (dom.viewDiagnostics) {
      dom.viewDiagnostics.classList.toggle('hidden', tabName !== 'diagnostics');
      dom.viewDiagnostics.classList.toggle('active', tabName === 'diagnostics');
    }

    // Re-render active view
    if (tabName === 'navigation') {
      setTimeout(() => renderNavMap(), 20);
    } else if (tabName === 'evidence') {
      setTimeout(() => {
        renderTrajectory();
        renderDriftChart();
      }, 20);
    }
  };

  // ============================================================================
  // 6. PRIMARY NAVIGATION PRODUCT FLOW: DESTINATION -> PREVIEW -> NAVIGATION
  // ============================================================================

  /**
   * Select a prototype Pune destination
   */
  window.selectPuneRoute = function (routeId) {
    if (!PUNE_ROUTES[routeId]) return;
    navState.currentRouteId = routeId;
    const route = PUNE_ROUTES[routeId];

    // Set internal kinematics source
    state.dataset = route.datasetSource;

    // Reset vehicle index
    navState.index = 0;
    navState.outageStartIdx = -1;
    navState.isArrived = false;

    // Update active highlight on destination cards
    const cardMap = {
      'pune-airport': dom.destCardAirport,
      'viman-nagar': dom.destCardViman,
      'pune-station': dom.destCardStation,
      'hinjawadi': dom.destCardHinjawadi
    };
    Object.keys(cardMap).forEach((id) => {
      if (cardMap[id]) {
        cardMap[id].classList.toggle('active', id === routeId);
      }
    });

    // Populate Route Preview card
    if (dom.previewRouteTitle) {
      dom.previewRouteTitle.textContent = `${route.departure} ➔ ${route.name}`;
    }
    if (dom.previewCorridorDesc) {
      dom.previewCorridorDesc.textContent = route.corridor;
    }
    if (dom.previewDistVal) {
      dom.previewDistVal.innerHTML = `${route.distKm.toFixed(1)} <span class="p-met-unit">KM</span>`;
    }
    if (dom.previewTimeVal) {
      dom.previewTimeVal.innerHTML = `~${route.durationMin} <span class="p-met-unit">MIN</span>`;
    }
    if (dom.previewArrivalVal) {
      dom.previewArrivalVal.innerHTML = `${route.arrivalDeterministic} <span class="p-met-unit">PM</span>`;
    }
    if (route.sectors && route.sectors.length >= 3) {
      if (dom.previewSector1Title) dom.previewSector1Title.textContent = route.sectors[0].title;
      if (dom.previewSector1Desc) dom.previewSector1Desc.textContent = route.sectors[0].desc;
      if (dom.previewSector2Title) dom.previewSector2Title.textContent = route.sectors[1].title;
      if (dom.previewSector2Desc) dom.previewSector2Desc.textContent = route.sectors[1].desc;
      if (dom.previewSector3Title) dom.previewSector3Title.textContent = route.sectors[2].title;
      if (dom.previewSector3Desc) dom.previewSector3Desc.textContent = route.sectors[2].desc;
    }

    // Advance to Step 2: Route Preview
    setFlowStep('preview');
  };

  /**
   * Set the flow step: 'destination' | 'preview' | 'navigating'
   */
  window.setFlowStep = function (step) {
    navState.flowStep = step;

    // Update mini stepper headers
    if (dom.stepBtnDest) dom.stepBtnDest.classList.toggle('active', step === 'destination');
    if (dom.stepBtnPreview) dom.stepBtnPreview.classList.toggle('active', step === 'preview');
    if (dom.stepBtnNav) dom.stepBtnNav.classList.toggle('active', step === 'navigating');

    // Manage card visibility
    if (dom.flowViewDest) dom.flowViewDest.classList.toggle('hidden', step !== 'destination');
    if (dom.flowViewPreview) dom.flowViewPreview.classList.toggle('hidden', step !== 'preview');

    // Manage live HUD visibility
    const isNav = step === 'navigating';
    if (dom.navInstructionCard) dom.navInstructionCard.classList.toggle('hidden', !isNav);
    if (dom.navBottomCard) dom.navBottomCard.classList.toggle('hidden', !isNav);
    if (dom.navArrivalCard) dom.navArrivalCard.classList.add('hidden');

    if (!isNav && navState.isPlaying) {
      togglePlayback();
    }

    updateNavigationUI();
    renderNavMap();
  };

  /**
   * Start live navigation simulation
   */
  window.startNavigation = function () {
    setFlowStep('navigating');
    navState.index = 0;
    navState.outageStartIdx = -1;
    navState.isArrived = false;

    updateNavigationUI();
    renderNavMap();

    // Start playback
    if (!navState.isPlaying) {
      togglePlayback();
    }
  };

  /**
   * Exit live navigation and return to destination selection
   */
  window.exitNavigation = function () {
    if (navState.isPlaying) {
      togglePlayback();
    }
    setFlowStep('destination');
  };

  /**
   * Replay current navigation route from start
   */
  window.replayNavigation = function () {
    if (dom.navArrivalCard) dom.navArrivalCard.classList.add('hidden');
    navState.index = 0;
    navState.outageStartIdx = -1;
    navState.isArrived = false;

    if (state.gnssOutage) {
      toggleGnssOutage(); // restore GNSS
    }

    setFlowStep('navigating');
    if (!navState.isPlaying) {
      togglePlayback();
    }
  };

  /**
   * Playback Pause / Resume toggle
   */
  window.togglePlayback = function () {
    navState.isPlaying = !navState.isPlaying;

    if (dom.dockPauseIcon) {
      dom.dockPauseIcon.textContent = navState.isPlaying ? '⏸' : '▶';
    }

    if (navState.isPlaying) {
      const tickInterval = 40; // 25 fps
      navState.playTimer = setInterval(() => {
        if (!dbData || !dbData[state.dataset]) return;
        const totalPts = dbData[state.dataset].trajectory.gt_east_m.length;

        navState.index += navState.speedMultiplier;

        if (navState.index >= totalPts - 4) {
          navState.index = totalPts - 1;
          handleDestinationArrival();
          return;
        }

        updateNavigationUI();
        renderNavMap();
      }, tickInterval);
    } else {
      if (navState.playTimer) {
        clearInterval(navState.playTimer);
        navState.playTimer = null;
      }
    }
  };

  /**
   * Handle vehicle reaching destination
   */
  function handleDestinationArrival() {
    navState.isArrived = true;
    if (navState.isPlaying) {
      togglePlayback();
    }

    const route = PUNE_ROUTES[navState.currentRouteId];

    // Update bottom dock
    if (dom.dockTimeRemaining) dom.dockTimeRemaining.textContent = '0 min';
    if (dom.dockDistRemaining) dom.dockDistRemaining.textContent = '0.0 km';
    if (dom.dockDistTravelled) dom.dockDistTravelled.textContent = route.distKm.toFixed(1);
    if (dom.navSpeedDisplay) dom.navSpeedDisplay.textContent = '0.0';

    // Update top instruction card
    if (dom.instructionDist) dom.instructionDist.textContent = 'Arrived';
    if (dom.instructionTitle) dom.instructionTitle.textContent = `You have arrived at ${route.name}`;
    if (dom.instructionSub) dom.instructionSub.textContent = `${route.arrivalName} · Navigation Complete`;
    if (dom.instructionIcon) dom.instructionIcon.textContent = '🏁';

    // Show arrival completion modal
    if (dom.arrivalTitle) {
      dom.arrivalTitle.textContent = `You have arrived at ${route.arrivalName}`;
    }
    if (dom.arrivalDesc) {
      dom.arrivalDesc.textContent = `Trip to ${route.name} completed successfully. Inertial dead reckoning maintained continuous vehicle guidance through simulated GNSS-denied sectors.`;
    }
    if (dom.navArrivalCard) {
      dom.navArrivalCard.classList.remove('hidden');
    }

    renderNavMap();
  }

  // ============================================================================
  // 7. GNSS OUTAGE DEMONSTRATION & RECOVERY
  // ============================================================================
  window.toggleGnssOutage = function () {
    state.gnssOutage = !state.gnssOutage;

    if (state.gnssOutage) {
      // OUTAGE ACTIVE
      navState.outageStartIdx = navState.index;

      // Top bar & buttons
      dom.gnssBadge.className = 'status-indicator outage';
      dom.gnssStatusText.textContent = 'DEAD RECKONING (IMU ONLY)';
      if (dom.btnQuickOutage) dom.btnQuickOutage.classList.add('active-outage');
      if (dom.quickOutageText) dom.quickOutageText.textContent = 'RESTORE GNSS';

      // Bottom dock buttons
      if (dom.btnDockOutage) dom.btnDockOutage.classList.add('active-outage');
      if (dom.dockOutageText) dom.dockOutageText.textContent = 'RESTORE GNSS SIGNAL';

      // Live HUD indicator
      if (dom.hudModeDot) dom.hudModeDot.className = 'hud-mode-dot outage';
      if (dom.hudModeTitle) dom.hudModeTitle.textContent = 'DEAD RECKONING';
      if (dom.hudOutageAlert) dom.hudOutageAlert.classList.remove('hidden');

      showToast({
        type: 'outage',
        icon: '⚠',
        title: 'GNSS SIGNAL LOST',
        desc: 'Switched to inertial dead reckoning (IMU-only). Navigation continues seamlessly.'
      });
    } else {
      // OUTAGE RECOVERED
      navState.outageStartIdx = -1;

      // Top bar & buttons
      dom.gnssBadge.className = 'status-indicator online';
      dom.gnssStatusText.textContent = 'GNSS + INS (ONLINE)';
      if (dom.btnQuickOutage) dom.btnQuickOutage.classList.remove('active-outage');
      if (dom.quickOutageText) dom.quickOutageText.textContent = 'SIMULATE OUTAGE';

      // Bottom dock buttons
      if (dom.btnDockOutage) dom.btnDockOutage.classList.remove('active-outage');
      if (dom.dockOutageText) dom.dockOutageText.textContent = 'SIMULATE GNSS OUTAGE';

      // Live HUD indicator
      if (dom.hudModeDot) dom.hudModeDot.className = 'hud-mode-dot';
      if (dom.hudModeTitle) dom.hudModeTitle.textContent = 'GNSS + INS';
      if (dom.hudOutageAlert) dom.hudOutageAlert.classList.add('hidden');

      showToast({
        type: 'recovered',
        icon: '✓',
        title: 'GNSS RECOVERED',
        desc: 'Multi-constellation lock reacquired. Dual-sensor fusion active (GNSS + INS).'
      });
    }

    updateNavigationUI();
    renderNavMap();
  };

  // ============================================================================
  // 8. LIVE NAVIGATION TELEMETRY UPDATES
  // ============================================================================
  function updateNavigationUI() {
    if (!dbData || !dbData[state.dataset]) return;
    const traj = dbData[state.dataset].trajectory;
    const totalPts = traj.gt_east_m.length;
    const idx = Math.min(Math.max(0, navState.index), totalPts - 1);
    const progress = idx / (totalPts - 1);

    const route = PUNE_ROUTES[navState.currentRouteId] || PUNE_ROUTES['pune-airport'];

    // Speedometer
    const currentSpeed = traj.speed_kmh[idx] || 0;
    if (dom.navSpeedDisplay) {
      dom.navSpeedDisplay.textContent = currentSpeed.toFixed(1);
    }

    // Distance countdown
    const remDist = Math.max(0, route.distKm * (1 - progress));
    const doneDist = route.distKm * progress;
    if (dom.dockDistRemaining) dom.dockDistRemaining.textContent = `${remDist.toFixed(1)} km`;
    if (dom.dockDistTravelled) dom.dockDistTravelled.textContent = doneDist.toFixed(1);

    // Time countdown & dynamic arrival time
    const remMin = Math.max(0, Math.ceil(route.durationMin * (1 - progress)));
    if (dom.dockTimeRemaining) dom.dockTimeRemaining.textContent = `${remMin} min`;
    if (dom.dockArriveTime) dom.dockArriveTime.textContent = route.arrivalDeterministic;

    // Heading / Bearing calculation
    const nextIdx = Math.min(idx + 1, totalPts - 1);
    const prevIdx = Math.max(idx - 1, 0);
    const de = traj.gt_east_m[nextIdx] - traj.gt_east_m[prevIdx];
    const dn = traj.gt_north_m[nextIdx] - traj.gt_north_m[prevIdx];
    let bearingDeg = 0;
    if (Math.abs(de) > 0.001 || Math.abs(dn) > 0.001) {
      bearingDeg = Math.round((Math.atan2(de, dn) * 180 / Math.PI + 360) % 360);
    }
    const cardinal = getCardinalDirection(bearingDeg);
    const bearingStr = bearingDeg.toString().padStart(3, '0');

    if (dom.compassBearingReadout) {
      dom.compassBearingReadout.textContent = `${bearingStr}° ${cardinal}`;
    }
    if (dom.compassArrowWrap) {
      dom.compassArrowWrap.style.transform = `rotate(${bearingDeg}deg)`;
    }

    // Dynamic Turn-by-Turn Instruction Cues (PROTOTYPE HUD)
    if (route.instructionCues && route.instructionCues.length > 0) {
      let activeCue = route.instructionCues[0];
      for (let i = 0; i < route.instructionCues.length; i++) {
        if (progress >= route.instructionCues[i].pct) {
          activeCue = route.instructionCues[i];
        }
      }
      if (dom.instructionDist) dom.instructionDist.textContent = activeCue.dist;
      if (dom.instructionTitle) dom.instructionTitle.textContent = activeCue.title;
      if (dom.instructionSub) dom.instructionSub.textContent = activeCue.sub;
      if (dom.instructionIcon) dom.instructionIcon.textContent = activeCue.icon;
    }
  }

  // ============================================================================
  // 9. HIGH-DPI CANVAS NAVIGATION MAP RENDERER
  // ============================================================================
  function renderNavMap() {
    if (!dom.canvasNavMap || !dbData || !dbData[state.dataset]) return;
    const traj = dbData[state.dataset].trajectory;
    const { ctx, width, height } = setupCanvas(dom.canvasNavMap);

    ctx.clearRect(0, 0, width, height);

    const totalPts = traj.gt_east_m.length;
    const activeIdx = Math.min(Math.max(0, navState.index), totalPts - 1);
    const route = PUNE_ROUTES[navState.currentRouteId] || PUNE_ROUTES['pune-airport'];

    // 1. Determine Coordinate Transformation
    const minE = Math.min(...traj.gt_east_m);
    const maxE = Math.max(...traj.gt_east_m);
    const minN = Math.min(...traj.gt_north_m);
    const maxN = Math.max(...traj.gt_north_m);

    const spanE = Math.max(maxE - minE, 500);
    const spanN = Math.max(maxN - minN, 500);

    const isNavigating = navState.flowStep === 'navigating' || navState.isArrived;

    let toScreenX, toScreenY;

    if (isNavigating) {
      // In live navigation: Camera smoothly follows vehicle, near-centered
      const curE = traj.gt_east_m[activeIdx];
      const curN = traj.gt_north_m[activeIdx];

      // Vehicle placed at ~54% from top so route ahead is clearly visible
      const originX = width * 0.5;
      const originY = height * 0.54;

      // Generous zoom scale for immersive navigation perspective
      const baseScale = Math.min(width / spanE, height / spanN);
      const navScale = baseScale * 1.55;

      toScreenX = (e) => originX + (e - curE) * navScale;
      toScreenY = (n) => originY - (n - curN) * navScale;
    } else {
      // In destination overview or route preview: Frame whole route
      const padX = 100;
      const padY = 90;
      const availW = Math.max(width - padX * 2, 100);
      const availH = Math.max(height - padY * 2, 100);

      const scale = Math.min(availW / spanE, availH / spanN);
      const centerE = (minE + maxE) / 2;
      const centerN = (minN + maxN) / 2;
      const originX = padX + availW / 2;
      const originY = padY + availH / 2;

      toScreenX = (e) => originX + (e - centerE) * scale;
      toScreenY = (n) => originY - (n - centerN) * scale;
    }

    // 2. Draw Subtle Pune City Secondary Street Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridStep = 45;
    for (let x = 0; x <= width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Draw Mula-Mutha River Ribbon (Pune Landmark Feature)
    ctx.save();
    ctx.strokeStyle = '#18232C';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const riverPts = [
      { e: minE - spanE * 0.4, n: minN - spanN * 0.15 },
      { e: minE + spanE * 0.1, n: minN + spanN * 0.08 },
      { e: minE + spanE * 0.45, n: minN + spanN * 0.28 },
      { e: minE + spanE * 0.85, n: minN + spanN * 0.52 },
      { e: minE + spanE * 1.35, n: minN + spanN * 0.75 }
    ];
    for (let i = 0; i < riverPts.length; i++) {
      const rx = toScreenX(riverPts[i].e);
      const ry = toScreenY(riverPts[i].n);
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.stroke();

    // Inner water stream
    ctx.strokeStyle = '#203240';
    ctx.lineWidth = 18;
    ctx.stroke();

    // River label
    const midRiverX = toScreenX(riverPts[2].e);
    const midRiverY = toScreenY(riverPts[2].n);
    ctx.fillStyle = 'rgba(100, 160, 210, 0.45)';
    ctx.font = '600 10px "Inter", sans-serif';
    ctx.fillText('〜 Mula-Mutha River Corridor', midRiverX - 40, midRiverY + 4);
    ctx.restore();

    // 4. Draw Background Pune Arterial Roads Network
    ctx.save();
    ctx.strokeStyle = '#231B1B';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    const arterialCorridors = [
      // FC Road to Sangamwadi
      [
        { e: minE - spanE * 0.2, n: minN + spanN * 0.2 },
        { e: minE + spanE * 0.25, n: minN + spanN * 0.15 },
        { e: minE + spanE * 0.7, n: minN + spanN * 0.1 }
      ],
      // Old Pune-Mumbai Highway branch
      [
        { e: minE + spanE * 0.05, n: minN - spanN * 0.3 },
        { e: minE + spanE * 0.15, n: minN + spanN * 0.35 },
        { e: minE + spanE * 0.4, n: minN + spanN * 0.9 }
      ],
      // Nagar Road Arterial Highway
      [
        { e: minE + spanE * 0.3, n: minN + spanN * 0.3 },
        { e: minE + spanE * 0.8, n: minN + spanN * 0.6 },
        { e: minE + spanE * 1.3, n: minN + spanN * 0.85 }
      ]
    ];
    arterialCorridors.forEach((path) => {
      ctx.beginPath();
      path.forEach((pt, i) => {
        const ax = toScreenX(pt.e);
        const ay = toScreenY(pt.n);
        if (i === 0) ctx.moveTo(ax, ay);
        else ctx.lineTo(ax, ay);
      });
      ctx.stroke();
    });
    ctx.restore();

    // 5. Draw Pune Landmark Chips on Map
    const landmarks = [
      { name: 'Shivajinagar Junction', e: traj.gt_east_m[0], n: traj.gt_north_m[0] + 80 },
      { name: 'Sancheti Flyover', e: traj.gt_east_m[Math.floor(totalPts * 0.15)], n: traj.gt_north_m[Math.floor(totalPts * 0.15)] - 90 },
      { name: 'Sangamwadi Bridge', e: traj.gt_east_m[Math.floor(totalPts * 0.35)], n: traj.gt_north_m[Math.floor(totalPts * 0.35)] + 100 },
      { name: 'Yerwada Chowk', e: traj.gt_east_m[Math.floor(totalPts * 0.55)], n: traj.gt_north_m[Math.floor(totalPts * 0.55)] - 90 },
      { name: 'Kalyani Nagar Link', e: traj.gt_east_m[Math.floor(totalPts * 0.75)], n: traj.gt_north_m[Math.floor(totalPts * 0.75)] + 90 },
      { name: route.arrivalName, e: traj.gt_east_m[totalPts - 1], n: traj.gt_north_m[totalPts - 1] - 80 }
    ];

    landmarks.forEach((lm) => {
      const lx = toScreenX(lm.e);
      const ly = toScreenY(lm.n);

      // Only draw if within visible canvas bounds
      if (lx > -40 && lx < width + 40 && ly > -30 && ly < height + 30) {
        ctx.save();
        ctx.fillStyle = 'rgba(28, 22, 22, 0.85)';
        ctx.strokeStyle = 'rgba(197, 170, 106, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lx - 6, ly - 9, lm.name.length * 6.5 + 16, 18, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#C5AA6A';
        ctx.font = '600 9px "Inter", sans-serif';
        ctx.fillText(`• ${lm.name}`, lx, ly + 3);
        ctx.restore();
      }
    });

    // 6. Draw Highlighted Primary Navigation Route Corridor
    // Layer A: Outer Dark Asphalt Road Casing
    ctx.save();
    ctx.strokeStyle = '#272020';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < totalPts; i++) {
      const sx = toScreenX(traj.gt_east_m[i]);
      const sy = toScreenY(traj.gt_north_m[i]);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Layer B: Completed Path Trail (behind the vehicle arrow)
    ctx.strokeStyle = '#C5AA6A';
    ctx.lineWidth = 7;
    ctx.shadowColor = 'rgba(197, 170, 106, 0.45)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let i = 0; i <= activeIdx; i++) {
      const sx = toScreenX(traj.gt_east_m[i]);
      const sy = toScreenY(traj.gt_north_m[i]);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();

    // Layer C: Ahead Route Road Surface (in front of arrow)
    ctx.save();
    ctx.strokeStyle = '#3E3434';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = activeIdx; i < totalPts; i++) {
      const sx = toScreenX(traj.gt_east_m[i]);
      const sy = toScreenY(traj.gt_north_m[i]);
      if (i === activeIdx) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Layer D: Dashed White Route Centerline Ahead
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    for (let i = activeIdx; i < totalPts; i++) {
      const sx = toScreenX(traj.gt_east_m[i]);
      const sy = toScreenY(traj.gt_north_m[i]);
      if (i === activeIdx) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();

    // 7. Branching Dead-Reckoning Divergence Trail during GNSS Outage
    if (state.gnssOutage) {
      const startI = navState.outageStartIdx >= 0 ? navState.outageStartIdx : 0;

      if (activeIdx > startI) {
        ctx.save();
        ctx.strokeStyle = '#FF5A36';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 5]);
        ctx.shadowColor = 'rgba(255, 90, 54, 0.7)';
        ctx.shadowBlur = 12;
        ctx.beginPath();

        for (let i = startI; i <= activeIdx; i++) {
          const p3_e_drift = (traj.p3_east_m[i] - traj.p3_east_m[startI]) * 0.15;
          const p3_n_drift = (traj.p3_north_m[i] - traj.p3_north_m[startI]) * 0.15;
          const sx = toScreenX(traj.gt_east_m[startI] + p3_e_drift);
          const sy = toScreenY(traj.gt_north_m[startI] + p3_n_drift);

          if (i === startI) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();

        // Expanding DR Uncertainty Circle
        const p3_e_last = (traj.p3_east_m[activeIdx] - traj.p3_east_m[startI]) * 0.15;
        const p3_n_last = (traj.p3_north_m[activeIdx] - traj.p3_north_m[startI]) * 0.15;
        const drX = toScreenX(traj.gt_east_m[startI] + p3_e_last);
        const drY = toScreenY(traj.gt_north_m[startI] + p3_n_last);

        const radius = Math.min(65, 16 + (activeIdx - startI) * 0.55);
        ctx.save();
        ctx.fillStyle = 'rgba(255, 90, 54, 0.12)';
        ctx.strokeStyle = 'rgba(255, 90, 54, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(drX, drY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFA38F';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillText('DEAD RECKONING DRIFT', drX + radius + 8, drY + 3);
        ctx.restore();
      }
    }

    // 8. Start Location Marker (Shivajinagar)
    const startX = toScreenX(traj.gt_east_m[0]);
    const startY = toScreenY(traj.gt_north_m[0]);
    ctx.save();
    ctx.fillStyle = '#55D285';
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#55D285';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillText('START: Shivajinagar', startX + 10, startY + 4);
    ctx.restore();

    // 9. Destination Pin Marker (e.g. Pune Airport)
    const endX = toScreenX(traj.gt_east_m[totalPts - 1]);
    const endY = toScreenY(traj.gt_north_m[totalPts - 1]);
    ctx.save();
    // Destination Beacon Pulse
    ctx.fillStyle = 'rgba(197, 170, 106, 0.2)';
    ctx.beginPath();
    ctx.arc(endX, endY, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C5AA6A';
    ctx.beginPath();
    ctx.arc(endX, endY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 11px "Space Grotesk", sans-serif';
    ctx.fillText(`🏁 ${route.name}`, endX + 12, endY + 4);
    ctx.restore();

    // 10. Moving 3D Navigation Arrow (Critical Requirement)
    let curVx, curVy;
    if (state.gnssOutage && navState.outageStartIdx >= 0) {
      // Moves along dead-reckoning position during outage
      const startI = navState.outageStartIdx;
      const p3_e_drift = (traj.p3_east_m[activeIdx] - traj.p3_east_m[startI]) * 0.15;
      const p3_n_drift = (traj.p3_north_m[activeIdx] - traj.p3_north_m[startI]) * 0.15;
      curVx = toScreenX(traj.gt_east_m[startI] + p3_e_drift);
      curVy = toScreenY(traj.gt_north_m[startI] + p3_n_drift);
    } else {
      // Moves along route trajectory
      curVx = toScreenX(traj.gt_east_m[activeIdx]);
      curVy = toScreenY(traj.gt_north_m[activeIdx]);
    }

    // Calculate heading angle
    const nextI = Math.min(activeIdx + 1, totalPts - 1);
    const prevI = Math.max(activeIdx - 1, 0);
    const nxtVx = toScreenX(traj.gt_east_m[nextI]);
    const nxtVy = toScreenY(traj.gt_north_m[nextI]);
    const prvVx = toScreenX(traj.gt_east_m[prevI]);
    const prvVy = toScreenY(traj.gt_north_m[prevI]);

    let headingAngle = Math.atan2(nxtVy - prvVy, nxtVx - prvVx);

    ctx.save();
    ctx.translate(curVx, curVy);
    ctx.rotate(headingAngle);

    // Forward Directional Headlight Beam
    const beamGrad = ctx.createLinearGradient(0, 0, 55, 0);
    beamGrad.addColorStop(0, 'rgba(255, 245, 215, 0.45)');
    beamGrad.addColorStop(1, 'rgba(255, 245, 215, 0.0)');

    ctx.save();
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(8, -6);
    ctx.lineTo(55, -22);
    ctx.lineTo(55, 22);
    ctx.lineTo(8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Radar / Satellite Beacon Pulse Ring
    ctx.save();
    const ringColor = state.gnssOutage ? 'rgba(255, 90, 54, 0.6)' : 'rgba(197, 170, 106, 0.45)';
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3D Navigation Chevron Arrow
    // Arrow Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.moveTo(18, 4);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-6, 4);
    ctx.lineTo(-10, 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Left Wing (Slightly darker for 3D depth)
    ctx.save();
    ctx.fillStyle = state.gnssOutage ? '#B8321B' : '#A88D4E';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(18, 0); // Tip
    ctx.lineTo(-10, -11); // Left Wing Tip
    ctx.lineTo(-6, 0); // Inner Notch
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing (Highlighted for 3D depth)
    ctx.fillStyle = state.gnssOutage ? '#FF5A36' : '#E8D49E';
    ctx.beginPath();
    ctx.moveTo(18, 0); // Tip
    ctx.lineTo(-6, 0); // Inner Notch
    ctx.lineTo(-10, 11); // Right Wing Tip
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center Spine Crest
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-6, 0);
    ctx.stroke();

    // Center Core Dot
    ctx.fillStyle = state.gnssOutage ? '#FFFFFF' : '#1F1919';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore arrow rotation
    ctx.restore(); // Restore canvas base transform

    // Floating Speed Tag near Arrow
    ctx.save();
    ctx.fillStyle = 'rgba(28, 22, 22, 0.9)';
    ctx.strokeStyle = state.gnssOutage ? '#FF5A36' : '#C5AA6A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(curVx + 18, curVy - 26, 74, 18, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = state.gnssOutage ? '#FFA38F' : '#C5AA6A';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillText(`${traj.speed_kmh[activeIdx].toFixed(0)} KM/H`, curVx + 24, curVy - 14);
    ctx.restore();
  }

  // ============================================================================
  // 10. SYSTEM EVIDENCE SECTION CANVASES (Preserved Intact)
  // ============================================================================

  /**
   * Switch Active Dataset (S-Vta1a <-> S-Vta2) inside System Evidence
   */
  window.switchDataset = function (seqName) {
    if (state.dataset === seqName) return;
    state.dataset = seqName;

    if (seqName === 'S-Vta1a') {
      if (dom.btnVta1a) dom.btnVta1a.classList.add('active');
      if (dom.btnVta2) dom.btnVta2.classList.remove('active');
    } else {
      if (dom.btnVta2) dom.btnVta2.classList.add('active');
      if (dom.btnVta1a) dom.btnVta1a.classList.remove('active');
    }

    updateMetricsUI();
    renderTrajectory();
    renderDriftChart();
  };

  /**
   * Update scalar numbers on System Evidence tab
   */
  function updateMetricsUI() {
    if (!dbData || !dbData[state.dataset]) return;
    const cur = dbData[state.dataset];
    const m = cur.metrics;

    if (dom.heroDatasetName) dom.heroDatasetName.textContent = cur.name;
    if (dom.heroDatasetDesc) dom.heroDatasetDesc.textContent = cur.description;

    if (dom.valDistance) dom.valDistance.textContent = m.distance_km.toFixed(2);
    if (dom.valDuration) dom.valDuration.textContent = m.duration_min.toFixed(1);
    if (dom.valSamples) dom.valSamples.textContent = `${m.total_samples.toLocaleString()} samples @ 10 Hz`;
    if (dom.valPeakSpeed) dom.valPeakSpeed.textContent = m.peak_speed_kmh.toFixed(1);
    if (dom.valMeanSpeed) dom.valMeanSpeed.textContent = m.mean_speed_kmh.toFixed(1);
    if (dom.valDriftPct) dom.valDriftPct.textContent = m.p3_drift_pct.toFixed(1);

    if (dom.captionDist) dom.captionDist.textContent = m.distance_km.toFixed(2);
    if (dom.captionErr) dom.captionErr.textContent = m.p3_final_err_km.toFixed(2);
    if (dom.captionTime) dom.captionTime.textContent = m.duration_min.toFixed(1);

    if (dom.p2FinalErr) dom.p2FinalErr.textContent = m.p2_final_err_km.toFixed(1);
    if (dom.p2Rmse) dom.p2Rmse.textContent = m.p2_rmse_km.toFixed(1);
    if (dom.p2Drift) dom.p2Drift.textContent = m.p2_drift_pct.toFixed(1);

    if (dom.p3FinalErr) dom.p3FinalErr.textContent = m.p3_final_err_km.toFixed(1);
    if (dom.p3Rmse) dom.p3Rmse.textContent = m.p3_rmse_km.toFixed(1);
    if (dom.p3Drift) dom.p3Drift.textContent = m.p3_drift_pct.toFixed(1);

    const sign = m.delta_final_km >= 0 ? '+' : '';
    if (dom.valDelta) {
      dom.valDelta.textContent = `${sign}${m.delta_final_km.toFixed(2)} km (${sign}${(m.p3_drift_pct - m.p2_drift_pct).toFixed(1)}% drift change)`;
    }
  }

  window.setScaleMode = function (mode) {
    if (state.scaleMode === mode) return;
    state.scaleMode = mode;
    if (mode === 'full') {
      if (dom.btnScaleFull) dom.btnScaleFull.classList.add('active');
      if (dom.btnScaleZoom) dom.btnScaleZoom.classList.remove('active');
    } else {
      if (dom.btnScaleZoom) dom.btnScaleZoom.classList.add('active');
      if (dom.btnScaleFull) dom.btnScaleFull.classList.remove('active');
    }
    renderTrajectory();
  };

  window.toggleLayer = function (layerId) {
    state.layers[layerId] = !state.layers[layerId];
    renderTrajectory();
  };

  /**
   * Trajectory Canvas Renderer (Phase 1 Ground Truth vs Phase 2 vs Phase 3)
   */
  function renderTrajectory() {
    if (!dom.canvasTrajectory || !dbData || !dbData[state.dataset]) return;
    const traj = dbData[state.dataset].trajectory;
    const { ctx, width, height } = setupCanvas(dom.canvasTrajectory);

    ctx.clearRect(0, 0, width, height);

    let minE, maxE, minN, maxN;

    if (state.scaleMode === 'zoom') {
      minE = Math.min(...traj.gt_east_m);
      maxE = Math.max(...traj.gt_east_m);
      minN = Math.min(...traj.gt_north_m);
      maxN = Math.max(...traj.gt_north_m);

      const spanE = Math.max(maxE - minE, 1000);
      const spanN = Math.max(maxN - minN, 1000);
      minE -= spanE * 0.15;
      maxE += spanE * 0.15;
      minN -= spanN * 0.15;
      maxN += spanN * 0.15;
    } else {
      const allE = [];
      const allN = [];
      if (state.layers.gt) { allE.push(...traj.gt_east_m); allN.push(...traj.gt_north_m); }
      if (state.layers.p2) { allE.push(...traj.p2_east_m); allN.push(...traj.p2_north_m); }
      if (state.layers.p3) { allE.push(...traj.p3_east_m); allN.push(...traj.p3_north_m); }

      if (allE.length === 0) {
        allE.push(...traj.gt_east_m);
        allN.push(...traj.gt_north_m);
      }

      minE = Math.min(...allE);
      maxE = Math.max(...allE);
      minN = Math.min(...allN);
      maxN = Math.max(...allN);

      const spanE = Math.max(maxE - minE, 5000);
      const spanN = Math.max(maxN - minN, 5000);
      minE -= spanE * 0.1;
      maxE += spanE * 0.1;
      minN -= spanN * 0.1;
      maxN += spanN * 0.1;
    }

    const dataWidth = maxE - minE;
    const dataHeight = maxN - minN;
    const padding = 50;
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;

    const scale = Math.min(drawW / dataWidth, drawH / dataHeight);
    const offsetX = padding + (drawW - dataWidth * scale) / 2;
    const offsetY = padding + (drawH - dataHeight * scale) / 2;

    function toScreen(e, n) {
      const x = offsetX + (e - minE) * scale;
      const y = height - (offsetY + (n - minN) * scale);
      return { x, y };
    }

    dom.canvasTrajectory._toScreen = toScreen;

    // Engineering grid
    drawEngineeringGrid(ctx, width, height, minE, maxE, minN, maxN, toScreen);

    const nPts = traj.time_s.length;

    // Phase 2: Pure Body INS
    if (state.layers.p2) {
      ctx.save();
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < nPts; i++) {
        const pt = toScreen(traj.p2_east_m[i], traj.p2_north_m[i]);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      const p2End = toScreen(traj.p2_east_m[nPts - 1], traj.p2_north_m[nPts - 1]);
      drawMarker(ctx, p2End.x, p2End.y, '#888888', 'P2 END');
    }

    // Phase 3: Leveled Vehicle INS
    if (state.layers.p3) {
      ctx.save();
      ctx.strokeStyle = '#C5AA6A';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      for (let i = 0; i < nPts; i++) {
        const pt = toScreen(traj.p3_east_m[i], traj.p3_north_m[i]);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      const p3End = toScreen(traj.p3_east_m[nPts - 1], traj.p3_north_m[nPts - 1]);
      drawMarker(ctx, p3End.x, p3End.y, '#C5AA6A', 'P3 END');
    }

    // Ground Truth
    if (state.layers.gt) {
      ctx.save();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let i = 0; i < nPts; i++) {
        const pt = toScreen(traj.gt_east_m[i], traj.gt_north_m[i]);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      const gtEnd = toScreen(traj.gt_east_m[nPts - 1], traj.gt_north_m[nPts - 1]);
      drawMarker(ctx, gtEnd.x, gtEnd.y, '#2563EB', 'GT END');
    }

    const origin = toScreen(0, 0);
    drawOriginMarker(ctx, origin.x, origin.y);
  }

  function drawEngineeringGrid(ctx, width, height, minE, maxE, minN, maxN, toScreen) {
    ctx.save();
    ctx.strokeStyle = '#EAE7E1';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8C857E';
    ctx.font = '10px "JetBrains Mono", monospace';

    const spanKm = Math.max(maxE - minE, maxN - minN) / 1000.0;
    let stepKm = 10;
    if (spanKm <= 5) stepKm = 1;
    else if (spanKm <= 20) stepKm = 5;
    else if (spanKm <= 80) stepKm = 20;
    else if (spanKm <= 200) stepKm = 50;
    else stepKm = 100;

    const stepM = stepKm * 1000;
    const startEM = Math.floor(minE / stepM) * stepM;
    const endEM = Math.ceil(maxE / stepM) * stepM;

    for (let em = startEM; em <= endEM; em += stepM) {
      const p1 = toScreen(em, minN);
      ctx.beginPath();
      ctx.moveTo(p1.x, 0);
      ctx.lineTo(p1.x, height);
      ctx.stroke();
      ctx.fillText(`${(em / 1000).toFixed(0)}k E`, p1.x + 4, height - 12);
    }

    const startNM = Math.floor(minN / stepM) * stepM;
    const endNM = Math.ceil(maxN / stepM) * stepM;

    for (let nm = startNM; nm <= endNM; nm += stepM) {
      const p1 = toScreen(minE, nm);
      ctx.beginPath();
      ctx.moveTo(0, p1.y);
      ctx.lineTo(width, p1.y);
      ctx.stroke();
      ctx.fillText(`${(nm / 1000).toFixed(0)}k N`, 10, p1.y - 4);
    }
    ctx.restore();
  }

  function drawOriginMarker(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#2A854E';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2F2626';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#2F2626';
    ctx.font = '600 10px "Space Grotesk", sans-serif';
    ctx.fillText('ORIGIN (0,0)', x + 8, y + 3);
    ctx.restore();
  }

  function drawMarker(ctx, x, y, color, label) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillText(label, x + 7, y + 3);
    ctx.restore();
  }

  function setupCanvasHover() {
    if (!dom.canvasTrajectory) return;
    dom.canvasTrajectory.addEventListener('mousemove', (e) => {
      if (!dbData || !dbData[state.dataset] || !dom.canvasTrajectory._toScreen) return;
      const rect = dom.canvasTrajectory.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const traj = dbData[state.dataset].trajectory;
      const toScreen = dom.canvasTrajectory._toScreen;
      let closestIdx = -1;
      let minPixelDist = 20;

      for (let i = 0; i < traj.time_s.length; i++) {
        const pt = toScreen(traj.gt_east_m[i], traj.gt_north_m[i]);
        const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
        if (dist < minPixelDist) {
          minPixelDist = dist;
          closestIdx = i;
        }
      }

      if (closestIdx !== -1) {
        state.hoveredIndex = closestIdx;
        const pt = toScreen(traj.gt_east_m[closestIdx], traj.gt_north_m[closestIdx]);
        if (dom.tooltip) {
          dom.tooltip.style.left = `${pt.x + 12}px`;
          dom.tooltip.style.top = `${pt.y - 12}px`;
          dom.tooltip.innerHTML = `
            <strong>t = ${traj.time_min[closestIdx].toFixed(1)} min</strong> (${traj.time_s[closestIdx].toFixed(0)}s)<br>
            GT Pos: (${(traj.gt_east_m[closestIdx] / 1000).toFixed(2)}k, ${(traj.gt_north_m[closestIdx] / 1000).toFixed(2)}k) km<br>
            Speed: ${traj.speed_kmh[closestIdx].toFixed(1)} km/h<br>
            Distance: ${traj.distance_km[closestIdx].toFixed(2)} km<br>
            P3 INS Error: <span style="color:#C5AA6A">${traj.p3_err_km[closestIdx].toFixed(2)} km</span>
          `;
          dom.tooltip.classList.remove('hidden');
        }
      } else {
        if (dom.tooltip) dom.tooltip.classList.add('hidden');
      }
    });

    dom.canvasTrajectory.addEventListener('mouseleave', () => {
      if (dom.tooltip) dom.tooltip.classList.add('hidden');
    });
  }

  /**
   * Drift Analysis Chart Renderer (Phase 2 vs Phase 3 Error)
   */
  function renderDriftChart() {
    if (!dom.canvasDrift || !dbData || !dbData[state.dataset]) return;
    const traj = dbData[state.dataset].trajectory;
    const { ctx, width, height } = setupCanvas(dom.canvasDrift);

    ctx.clearRect(0, 0, width, height);

    const padLeft = 55;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;

    const maxT = Math.max(...traj.time_min);
    const maxErr = Math.max(...traj.p2_err_km, ...traj.p3_err_km) * 1.1;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    function getX(t) {
      return padLeft + (t / maxT) * plotW;
    }
    function getY(err) {
      return height - padBottom - (err / maxErr) * plotH;
    }

    // Grid & Axes
    ctx.save();
    ctx.strokeStyle = '#EAE7E1';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8C857E';
    ctx.font = '10px "JetBrains Mono", monospace';

    const errStep = maxErr > 300 ? 100 : 50;
    for (let e = 0; e <= maxErr; e += errStep) {
      const y = getY(e);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${e} km`, 8, y + 3);
    }

    const tStep = maxT > 30 ? 10 : 5;
    for (let t = 0; t <= maxT; t += tStep) {
      const x = getX(t);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();
      ctx.fillText(`${t}m`, x - 8, height - padBottom + 16);
    }

    ctx.fillStyle = '#2F2626';
    ctx.font = '600 10px "Space Grotesk", sans-serif';
    ctx.fillText('ELAPSED TIME (MINUTES)', padLeft + plotW / 2 - 50, height - 10);
    ctx.save();
    ctx.translate(14, padTop + plotH / 2 + 40);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('2D POSITION ERROR (KM)', 0, 0);
    ctx.restore();
    ctx.restore();

    // Plot Phase 2 Curve (Gray Dotted)
    ctx.save();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i < traj.time_min.length; i++) {
      const x = getX(traj.time_min[i]);
      const y = getY(traj.p2_err_km[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Plot Phase 3 Curve (Warning Red)
    ctx.save();
    ctx.strokeStyle = '#C95232';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i < traj.time_min.length; i++) {
      const x = getX(traj.time_min[i]);
      const y = getY(traj.p3_err_km[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Final Callout
    const lastIdx = traj.time_min.length - 1;
    const finalX = getX(traj.time_min[lastIdx]);
    const finalY = getY(traj.p3_err_km[lastIdx]);

    ctx.save();
    ctx.fillStyle = '#C95232';
    ctx.beginPath();
    ctx.arc(finalX, finalY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2F2626';
    ctx.font = '700 11px "Space Grotesk", sans-serif';
    ctx.fillText(`${traj.p3_err_km[lastIdx].toFixed(1)} km`, finalX - 55, finalY - 8);
    ctx.restore();
  }

  // ============================================================================
  // 11. HELPER UTILITIES
  // ============================================================================
  function showToast(info) {
    if (!dom.toast) return;
    if (state.toastTimer) clearTimeout(state.toastTimer);
    dom.toast.className = `gnss-toast ${info.type}`;
    if (dom.toastIcon) dom.toastIcon.textContent = info.icon;
    if (dom.toastTitle) dom.toastTitle.textContent = info.title;
    if (dom.toastDesc) dom.toastDesc.textContent = info.desc;

    state.toastTimer = setTimeout(() => {
      dismissToast();
    }, 7000);
  }

  window.dismissToast = function () {
    if (dom.toast) dom.toast.classList.add('hidden');
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
  };

  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  function getCardinalDirection(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
    return directions[idx];
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
