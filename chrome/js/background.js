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
    await chrome.tabs.update({ url: url });
  } else if (windowChoice === 'new_tab') {
    await chrome.tabs.create({ url: url });
  } else if (windowChoice === 'new_window') {

    const width = 480;
    const height = 608;

    const createInfo = {
      width: width,
      height: height,
      type: 'popup',
      url: url
    };
    const updateInfo = {};

    const displayInfo = await chrome.system.display.getInfo({ singleUnified: true });
    const screenInfo = displayInfo[0].bounds;

    const windowInfo = await chrome.windows.getCurrent();
    console.log(`screen width: ${screenInfo.width}, screen height: ${screenInfo.height}`);
    console.log(`window top: ${windowInfo.top}, window left: ${windowInfo.left}`);
    console.log(`window width: ${windowInfo.width}, window height: ${windowInfo.height}`);
    console.log(`width: ${width}, height: ${height}`);

    let top = Math.round(windowInfo.top + (windowInfo.height * 0.17));
    if (top + height < screenInfo.height && top + height < windowInfo.top + windowInfo.height) {
      createInfo.top = top;
      updateInfo.top = top;
    } else {
      top = windowInfo.top + windowInfo.height - height - 16;
      if (top + height < screenInfo.height) {
        createInfo.top = top;
        updateInfo.top = top;
      }
    }
    let left = Math.round(windowInfo.left + (windowInfo.width * 0.57));
    if (left + width < screenInfo.width && left + width < windowInfo.left + windowInfo.width) {
      createInfo.left = left;
      updateInfo.left = left;
    } else {
      left = windowInfo.left + windowInfo.width - width - 16;
      if (left + width < screenInfo.width) {
        createInfo.left = left;
        updateInfo.left = left;
      }
    }
    console.log(`top: ${top}, left: ${left}`);

    await chrome.windows.create(createInfo);
  } else {
    console.log('Invalid windowChoice');
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({ windowChoice: 'manual' });
  await chrome.action.setPopup({ popup: 'popup.html' });

  console.log('onInstalled: set storage and popup succeeded.');
});

chrome.runtime.onStartup.addListener(async () => {
  const { windowChoice } = await chrome.storage.sync.get('windowChoice');
  const popupPage = windowChoice === 'manual' ? 'popup.html' : '';
  await chrome.action.setPopup({ popup: popupPage });

  console.log('onStartup: set popup succeeded.');
});

chrome.management.onEnabled.addListener(async () => {
  const { windowChoice } = await chrome.storage.sync.get('windowChoice');
  const popupPage = windowChoice === 'manual' ? 'popup.html' : '';
  await chrome.action.setPopup({ popup: popupPage });

  console.log('onEnabled: set popup succeeded.');
});

chrome.action.onClicked.addListener(async () => {
  const { windowChoice } = await chrome.storage.sync.get('windowChoice');
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
