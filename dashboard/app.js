/**
 * IDR-NAV Dashboard Core Application Logic
 * Pure Vanilla JavaScript — Zero build step, zero CORS risk.
 * Handles high-DPI canvas trajectory and drift rendering,
 * real metric binding, dataset switching, and GNSS outage simulation.
 */

(function () {
  'use strict';

  // Global Dashboard State
  const state = {
    dataset: 'S-Vta1a',
    scaleMode: 'full', // 'full' or 'zoom'
    layers: {
      gt: true,
      p2: true,
      p3: true,
    },
    gnssOutage: false,
    hoveredIndex: -1,
    toastTimer: null,
  };

  let dbData = null;

  // Cache DOM Elements
  const dom = {
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
    valRoll: document.getElementById('val-roll'),
    valPitch: document.getElementById('val-pitch'),
    btnScaleFull: document.getElementById('btn-scale-full'),
    btnScaleZoom: document.getElementById('btn-scale-zoom'),
    canvasTrajectory: document.getElementById('trajectory-canvas'),
    canvasDrift: document.getElementById('drift-canvas'),
    tooltip: document.getElementById('canvas-tooltip'),
    gnssBadge: document.getElementById('gnss-status-badge'),
    gnssStatusText: document.getElementById('gnss-status-text'),
    btnSimulate: document.getElementById('btn-simulate-gnss'),
    btnSimulateText: document.getElementById('btn-simulate-text'),
    toast: document.getElementById('gnss-alert-toast'),
    toastIcon: document.getElementById('toast-icon'),
    toastTitle: document.getElementById('toast-title'),
    toastDesc: document.getElementById('toast-desc'),
  };

  /**
   * Initialize Dashboard
   */
  function init() {
    // 1. Resolve Data: window.IDR_DATA (from dashboard_data.js) or fallback to fetch
    if (window.IDR_DATA) {
      dbData = window.IDR_DATA;
      setupDashboard();
    } else {
      fetch('data/dashboard_data.json')
        .then((res) => res.json())
        .then((data) => {
          dbData = data;
          setupDashboard();
        })
        .catch((err) => {
          console.error('Failed to load dashboard data JSON:', err);
        });
    }

    // 2. Setup Resize & Interaction Listeners
    window.addEventListener('resize', debounce(() => {
      renderTrajectory();
      renderDriftChart();
    }, 150));

    setupCanvasHover();
    setupNavLinks();
  }

  /**
   * Setup Navigation Link Scroll Observer
   */
  function setupNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = Array.from(navLinks).map(link => {
      const id = link.getAttribute('href').substring(1);
      return document.getElementById(id);
    }).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      let activeSectionId = null;
      
      // Find the most visible intersecting section
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeSectionId = entry.target.id;
        }
      });

      if (activeSectionId) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeSectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));

    // Also keep the click listener for immediate feedback
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        navLinks.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  }

  function setupDashboard() {
    updateMetricsUI();
    renderTrajectory();
    renderDriftChart();
  }

  /**
   * Switch Active Dataset (S-Vta1a <-> S-Vta2)
   */
  window.switchDataset = function (seqName) {
    if (state.dataset === seqName) return;
    state.dataset = seqName;

    // Toggle button active states
    if (seqName === 'S-Vta1a') {
      dom.btnVta1a.classList.add('active');
      dom.btnVta2.classList.remove('active');
    } else {
      dom.btnVta2.classList.add('active');
      dom.btnVta1a.classList.remove('active');
    }

    updateMetricsUI();
    renderTrajectory();
    renderDriftChart();
  };

  /**
   * Update all scalar numbers, metrics, and text across the UI
   */
  function updateMetricsUI() {
    if (!dbData || !dbData[state.dataset]) return;
    const cur = dbData[state.dataset];
    const m = cur.metrics;

    dom.heroDatasetName.textContent = cur.name;
    dom.heroDatasetDesc.textContent = cur.description;

    dom.valDistance.textContent = m.distance_km.toFixed(2);
    dom.valDuration.textContent = m.duration_min.toFixed(1);
    dom.valSamples.textContent = `${m.total_samples.toLocaleString()} samples @ 10 Hz`;
    dom.valPeakSpeed.textContent = m.peak_speed_kmh.toFixed(1);
    dom.valMeanSpeed.textContent = m.mean_speed_kmh.toFixed(1);
    dom.valDriftPct.textContent = m.p3_drift_pct.toFixed(1);

    dom.captionDist.textContent = m.distance_km.toFixed(2);
    dom.captionErr.textContent = m.p3_final_err_km.toFixed(2);
    dom.captionTime.textContent = m.duration_min.toFixed(1);

    dom.p2FinalErr.textContent = m.p2_final_err_km.toFixed(1);
    dom.p2Rmse.textContent = m.p2_rmse_km.toFixed(1);
    dom.p2Drift.textContent = m.p2_drift_pct.toFixed(1);

    dom.p3FinalErr.textContent = m.p3_final_err_km.toFixed(1);
    dom.p3Rmse.textContent = m.p3_rmse_km.toFixed(1);
    dom.p3Drift.textContent = m.p3_drift_pct.toFixed(1);

    if (dom.valRoll && dom.valPitch) {
      dom.valRoll.textContent = m.roll_tilt_deg.toFixed(2);
      dom.valPitch.textContent = m.pitch_tilt_deg.toFixed(2);
    }

    const sign = m.delta_final_km >= 0 ? '+' : '';
    dom.valDelta.textContent = `${sign}${m.delta_final_km.toFixed(2)} km (${sign}${(m.p3_drift_pct - m.p2_drift_pct).toFixed(1)}% drift change)`;
  }

  /**
   * Toggle View Scale Mode (Full global scale vs Zoom to ground truth)
   */
  window.setScaleMode = function (mode) {
    if (state.scaleMode === mode) return;
    state.scaleMode = mode;
    if (mode === 'full') {
      dom.btnScaleFull.classList.add('active');
      dom.btnScaleZoom.classList.remove('active');
    } else {
      dom.btnScaleZoom.classList.add('active');
      dom.btnScaleFull.classList.remove('active');
    }
    renderTrajectory();
  };

  /**
   * Toggle Individual Layers (Ground Truth, Phase 2, Phase 3)
   */
  window.toggleLayer = function (layerId) {
    state.layers[layerId] = !state.layers[layerId];
    renderTrajectory();
  };

  /**
   * GNSS Outage Simulation Handler (Section 13a)
   */
  window.toggleGnssOutage = function () {
    state.gnssOutage = !state.gnssOutage;

    if (state.gnssOutage) {
      // Outage triggered
      dom.gnssBadge.className = 'status-indicator outage';
      dom.gnssStatusText.textContent = 'DEAD RECKONING (IMU ONLY)';
      dom.btnSimulate.classList.add('active-outage');
      dom.btnSimulateText.textContent = 'RESTORE GNSS SIGNAL';

      showToast({
        type: 'outage',
        icon: '⚠',
        title: 'GNSS SIGNAL LOST',
        desc: 'Vehicle entered GNSS-denied zone. Navigation handoff active: operating on pure inertial dead reckoning.',
      });
    } else {
      // Outage recovered
      dom.gnssBadge.className = 'status-indicator online';
      dom.gnssStatusText.textContent = 'GNSS + INS (ONLINE)';
      dom.btnSimulate.classList.remove('active-outage');
      dom.btnSimulateText.textContent = 'SIMULATE GNSS OUTAGE';

      showToast({
        type: 'recovered',
        icon: '✓',
        title: 'GNSS SIGNAL REACQUIRED',
        desc: 'Line-of-sight satellite tracking restored. Multi-sensor fusion active: GNSS position + vehicle IMU.',
      });
    }
  };

  function showToast(info) {
    if (state.toastTimer) clearTimeout(state.toastTimer);

    dom.toast.className = `gnss-toast ${info.type}`;
    dom.toastIcon.textContent = info.icon;
    dom.toastTitle.textContent = info.title;
    dom.toastDesc.textContent = info.desc;

    state.toastTimer = setTimeout(() => {
      dismissToast();
    }, 7500);
  }

  window.dismissToast = function () {
    dom.toast.classList.add('hidden');
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
  };

  /**
   * High-DPI Canvas Setup Helper
   */
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

  /**
   * Trajectory Canvas Renderer
   */
  function renderTrajectory() {
    if (!dbData || !dbData[state.dataset]) return;
    const traj = dbData[state.dataset].trajectory;
    const { ctx, width, height } = setupCanvas(dom.canvasTrajectory);

    ctx.clearRect(0, 0, width, height);

    // 1. Determine Coordinate Bounds
    let minE, maxE, minN, maxN;

    if (state.scaleMode === 'zoom') {
      // Zoom tightly to Ground Truth with margin
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
      // Full scale covering all active paths
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

    // Preserve Aspect Ratio
    const dataWidth = maxE - minE;
    const dataHeight = maxN - minN;
    const padding = 50;
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;

    const scale = Math.min(drawW / dataWidth, drawH / dataHeight);
    const offsetX = padding + (drawW - dataWidth * scale) / 2;
    const offsetY = padding + (drawH - dataHeight * scale) / 2;

    // Coordinate Mapping Function (East -> X, North -> Y where North points UP)
    function toScreen(e, n) {
      const x = offsetX + (e - minE) * scale;
      const y = height - (offsetY + (n - minN) * scale);
      return { x, y };
    }

    // Save mapping on canvas for hover
    dom.canvasTrajectory._toScreen = toScreen;
    dom.canvasTrajectory._bounds = { minE, maxE, minN, maxN, scale };

    // 2. Draw Subtle Engineering Grid & Axis Labels
    drawEngineeringGrid(ctx, width, height, minE, maxE, minN, maxN, toScreen);

    // 3. Draw Trajectory Paths
    const nPts = traj.time_s.length;

    // Phase 2: Pure Body INS (Gray Dashed)
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

      // P2 End Marker
      const p2End = toScreen(traj.p2_east_m[nPts - 1], traj.p2_north_m[nPts - 1]);
      drawMarker(ctx, p2End.x, p2End.y, '#888888', 'P2 END');
    }

    // Phase 3: Aligned Vehicle INS (Metallic Tan / Warning Accent)
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

      // P3 End Marker
      const p3End = toScreen(traj.p3_east_m[nPts - 1], traj.p3_north_m[nPts - 1]);
      drawMarker(ctx, p3End.x, p3End.y, '#C5AA6A', 'P3 END');
    }

    // Ground Truth (Deep Charcoal + Blue Accent Line)
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

      // GT End Marker
      const gtEnd = toScreen(traj.gt_east_m[nPts - 1], traj.gt_north_m[nPts - 1]);
      drawMarker(ctx, gtEnd.x, gtEnd.y, '#2563EB', 'GT END');
    }

    // Origin Marker (0, 0)
    const origin = toScreen(0, 0);
    drawOriginMarker(ctx, origin.x, origin.y);
  }

  function drawEngineeringGrid(ctx, width, height, minE, maxE, minN, maxN, toScreen) {
    ctx.save();
    ctx.strokeStyle = '#EAE7E1';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8C857E';
    ctx.font = '10px "JetBrains Mono", monospace';

    // Calculate grid step in km
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
      const p2 = toScreen(em, maxN);
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

  /**
   * Hover Tooltip on Trajectory Canvas
   */
  function setupCanvasHover() {
    dom.canvasTrajectory.addEventListener('mousemove', (e) => {
      if (!dbData || !dbData[state.dataset] || !dom.canvasTrajectory._toScreen) return;
      const rect = dom.canvasTrajectory.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const traj = dbData[state.dataset].trajectory;
      const toScreen = dom.canvasTrajectory._toScreen;
      let closestIdx = -1;
      let minPixelDist = 20; // 20px threshold

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
        dom.tooltip.style.left = `${pt.x + 12}px`;
        dom.tooltip.style.top = `${pt.y - 12}px`;
        dom.tooltip.innerHTML = `
          <strong>t = ${traj.time_min[closestIdx].toFixed(1)} min</strong> (${traj.time_s[closestIdx].toFixed(0)}s)<br>
          GT Pos: (${(traj.gt_east_m[closestIdx]/1000).toFixed(2)}k, ${(traj.gt_north_m[closestIdx]/1000).toFixed(2)}k) km<br>
          Speed: ${traj.speed_kmh[closestIdx].toFixed(1)} km/h<br>
          Distance: ${traj.distance_km[closestIdx].toFixed(2)} km<br>
          P3 INS Error: <span style="color:#C5AA6A">${traj.p3_err_km[closestIdx].toFixed(2)} km</span>
        `;
        dom.tooltip.classList.remove('hidden');
      } else {
        dom.tooltip.classList.add('hidden');
      }
    });

    dom.canvasTrajectory.addEventListener('mouseleave', () => {
      dom.tooltip.classList.add('hidden');
    });
  }

  /**
   * Drift Analysis Chart Renderer (Error vs Time)
   */
  function renderDriftChart() {
    if (!dbData || !dbData[state.dataset]) return;
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

    // Horizontal grid ticks (Error in km)
    const errStep = maxErr > 300 ? 100 : 50;
    for (let e = 0; e <= maxErr; e += errStep) {
      const y = getY(e);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${e} km`, 8, y + 3);
    }

    // Vertical grid ticks (Time in minutes)
    const tStep = maxT > 30 ? 10 : 5;
    for (let t = 0; t <= maxT; t += tStep) {
      const x = getX(t);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();
      ctx.fillText(`${t}m`, x - 8, height - padBottom + 16);
    }

    // Axis titles
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

    // Plot Phase 3 Curve (Warning Red / Solid)
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

    // Final value callout tag on Phase 3 curve
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

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
