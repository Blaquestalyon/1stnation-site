/* ============================================================
   1ST NATION FOUNDATION — main.js
   Mobile nav, scroll reveal, Airtable-ready contact form.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contact form → Airtable ----------
     WIRING INSTRUCTIONS (see README.md for full detail):

     Option A (recommended): point ENDPOINT at a tiny proxy route
     (e.g. /api/contact on this same Railway service) that holds your
     Airtable Personal Access Token server-side. server.js already
     includes this route — just set the environment variables
     AIRTABLE_TOKEN, AIRTABLE_BASE, AIRTABLE_TABLE in Railway.

     Option B: replace ENDPOINT with your Airtable Form URL and
     swap this handler for a simple redirect, or post directly to
     the Airtable API (not recommended — exposes your token).
  ------------------------------------------------ */
  var ENDPOINT = '/api/contact';

  var form = document.getElementById('contact-form');
  if (form) {
    var statusBox = document.getElementById('form-status');

    function setStatus(type, msg) {
      statusBox.className = 'form-status ' + type;
      statusBox.textContent = msg;
      statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function validateField(field) {
      var wrapper = field.closest('.field');
      var ok = field.checkValidity();
      if (wrapper) wrapper.classList.toggle('invalid', !ok);
      return ok;
    }

    form.querySelectorAll('input, textarea, select').forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f); });
      f.addEventListener('input', function () {
        var wrapper = f.closest('.field');
        if (wrapper && wrapper.classList.contains('invalid') && f.checkValidity()) {
          wrapper.classList.remove('invalid');
        }
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var allValid = true;
      form.querySelectorAll('input, textarea, select').forEach(function (f) {
        if (!validateField(f)) allValid = false;
      });
      if (!allValid) {
        setStatus('error', 'Please complete the highlighted fields and try again.');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      var payload = {
        fields: {
          'Name': form.elements['name'].value.trim(),
          'Email': form.elements['email'].value.trim(),
          'Phone': form.elements['phone'].value.trim(),
          'State': form.elements['state'].value.trim(),
          'Ancestral Tribe (if known)': form.elements['tribe'].value,
          'Searched Dawes Rolls': form.elements['dawes'].value,
          'Message': form.elements['message'].value.trim(),
          'Consent': form.elements['consent'].checked ? 'Yes' : 'No',
          'Submitted': new Date().toISOString()
        }
      };

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed: ' + res.status);
          return res.json().catch(function () { return {}; });
        })
        .then(function () {
          form.reset();
          setStatus('success',
            'Received. Your request is in our hands — a member of the 1st Nation Foundation team will reach out with guidance on your next steps. Your ancestors are waiting to be found.');
        })
        .catch(function () {
          setStatus('error',
            'Your message could not be sent right now. Please try again in a few minutes, or email us directly — the address is in the footer below.');
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = originalLabel;
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
