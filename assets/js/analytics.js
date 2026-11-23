/*
 * PostHog analytics — shared by the landing page and the demo.
 *
 * Personal links: append ?ref=<prospect> to any URL (e.g. /demo/?ref=acme-pest).
 * The ref is saved on the visitor and attached to every event after that, so in
 * PostHog you can filter Activity / Persons / Replays by `ref`.
 *
 * Your own visits: open any page once with ?notrack to stop tracking in that
 * browser (?track turns it back on). Localhost and file:// never send data.
 *
 * The phc_ key is a public, write-only project key, so it is safe in client code.
 */
(function () {
  var KEY = "phc_PBK3OOIE9TNmNIMI1eqqTgPzLouiLKqmIXv0RMnejq9";
  var HOST = "https://us.i.posthog.com";

  // Official PostHog loader stub: queues calls until array.js loads.
  // prettier-ignore
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  var params = new URLSearchParams(location.search);
  var isLocal =
    location.protocol === "file:" ||
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: "always", // every visitor gets a profile, not just identified ones
    capture_pageview: true,
    capture_pageleave: true, // gives time-on-page
    loaded: function (ph) {
      if (isLocal) ph.opt_out_capturing();
      if (params.has("notrack")) ph.opt_out_capturing();
      if (params.has("track")) ph.opt_in_capturing();
    },
  });

  // Attach ?ref= to the visitor and to every later event (survives page changes).
  var ref = (params.get("ref") || "").trim();
  if (ref) {
    posthog.register({ ref: ref });
    posthog.setPersonProperties({ ref: ref }, { first_ref: ref });
  }

  // Safe helper for custom events; never throws if PostHog is blocked.
  window.track = function (event, props) {
    try {
      window.posthog && window.posthog.capture(event, props);
    } catch (e) {}
  };
})();
