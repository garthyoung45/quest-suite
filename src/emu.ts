// Dev only: `?emu=1` installs the IWER headset emulator so hands can be tested without a Quest.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('emu')) {
  const { XRDevice, metaQuest3 } = await import('iwer');
  const d = new XRDevice(metaQuest3);
  d.installRuntime({ forceInstall: true });
  d.primaryInputMode = 'hand';
  (window as any).__xr = d;
}
export {};
