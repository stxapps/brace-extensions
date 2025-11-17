async function goToBrace(windowChoice) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log(`windowChoice: ${windowChoice}`);
  console.log(`Current tab url: ${tab.url}`);

  if (!tab.url || tab.url === '') return;

  let url = new URL(tab.url);
  if (windowChoice === 'new_window') {
    url.searchParams.append('brace-dot-to-show-close', 'window');
  }
  url = 'https://brace.to/' + url.toString();

  if (windowChoice === 'current_tab') {
    try {
      await chrome.tabs.update({ url: url });
    } catch (e) {
      console.log(`Could not update tab: ${e.message}`);
    }
  } else if (windowChoice === 'new_tab') {
    await chrome.tabs.create({ url: url });
  } else if (windowChoice === 'new_window') {
    const createInfo = {
      width: 480, height: 608, type: 'popup', url: url, setSelfAsOpener: true,
    };
    const displayInfo = await chrome.system.display.getInfo({ singleUnified: true });
    const screenInfo = displayInfo[0].bounds;
    const windowInfo = await chrome.windows.getCurrent();
    console.log(
      `screen width: ${screenInfo.width}, screen height: ${screenInfo.height}`
    );
    console.log(
      `window top: ${windowInfo.top}, window left: ${windowInfo.left}`
    );
    console.log(
      `window width: ${windowInfo.width}, window height: ${windowInfo.height}`
    );
    console.log(`width: ${createInfo.width}, height: ${createInfo.height}`);

    // Calculate desired position
    let top = Math.round(windowInfo.top + (windowInfo.height * 0.17));
    let left = Math.round(windowInfo.left + (windowInfo.width * 0.57));

    // Adjust if it overflows the screen
    top = Math.min(top, screenInfo.height - createInfo.height - 16);
    left = Math.min(left, screenInfo.width - createInfo.width - 16);

    createInfo.top = Math.max(0, top);
    createInfo.left = Math.max(0, left);
    console.log(`top: ${createInfo.top}, left: ${createInfo.left}`);

    await chrome.windows.create(createInfo);
  } else {
    console.log('Invalid windowChoice');
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const { windowChoice } = await chrome.storage.sync.get('windowChoice');
    if (['current_tab', 'new_tab', 'new_window', 'manual'].includes(windowChoice)) {
      await chrome.storage.local.set({ windowChoice: windowChoice });
      await chrome.storage.sync.clear();
      console.log('Migrated settings from sync to local storage.');
    }
  } else if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await chrome.storage.local.set({ windowChoice: 'manual' });
    console.log('OnInstalled: set storage succeeded.');
  }

  const { windowChoice } = await chrome.storage.local.get('windowChoice');
  const popupPage = windowChoice === 'manual' ? 'popup.html' : '';
  await chrome.action.setPopup({ popup: popupPage });

  console.log('onInstalled: set popup succeeded.');
});

chrome.runtime.onStartup.addListener(async () => {
  const { windowChoice } = await chrome.storage.local.get('windowChoice');
  const popupPage = windowChoice === 'manual' ? 'popup.html' : '';
  await chrome.action.setPopup({ popup: popupPage });

  console.log('onStartup: set popup succeeded.');
});

chrome.management.onEnabled.addListener(async () => {
  const { windowChoice } = await chrome.storage.local.get('windowChoice');
  const popupPage = windowChoice === 'manual' ? 'popup.html' : '';
  await chrome.action.setPopup({ popup: popupPage });

  console.log('onEnabled: set popup succeeded.');
});

chrome.action.onClicked.addListener(async () => {
  const { windowChoice } = await chrome.storage.local.get('windowChoice');
  await goToBrace(windowChoice);
});

chrome.runtime.onMessage.addListener(async (message, sender, reply) => {
  console.log('Runtime message: ', message);
  if (!message || typeof message !== 'object') {
    console.log('Invalid message');
    return;
  }

  const { type, payload } = message;

  if (type === 'GO_TO_BRACE') {
    await goToBrace(payload);
  } else {
    console.log('Invalid message type');
  }
});
