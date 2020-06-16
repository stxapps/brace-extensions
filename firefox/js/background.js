async function goToBrace(windowChoice) {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  console.log(`windowChoice: ${windowChoice}`);
  console.log(`Current tab url: ${tab.url}`);

  if (!tab.url || tab.url === '') return;

  let url = new URL(tab.url);
  if (windowChoice === 'new_window') {
    url.searchParams.append('brace-dot-to-show-close', 'window');
  }
  url = 'https://brace.to/' + url.toString();

  if (windowChoice === 'current_tab') {
    await browser.tabs.update({ url: url });
  } else if (windowChoice === 'new_tab') {
    await browser.tabs.create({ url: url });
  } else if (windowChoice === 'new_window') {

    const width = 480;
    const height = 608;

    const createInfo = {
      allowScriptsToClose: true,
      width: width,
      height: height,
      type: 'popup',
      url: url
    };
    const updateInfo = {};

    const screenInfo = window.screen;
    const windowInfo = await browser.windows.getCurrent();
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

    const { id } = await browser.windows.create(createInfo);
    if (updateInfo.top || updateInfo.left) {
      await browser.windows.update(id, updateInfo);
    }
  } else {
    console.log('Invalid windowChoice');
  }
}

browser.runtime.onInstalled.addListener(async () => {
  await browser.storage.sync.set({ windowChoice: 'current_tab' });
  await browser.browserAction.setPopup({ popup: '' });

  console.log('onInstalled: set storage and popup succeeded.');
});

browser.browserAction.onClicked.addListener(async () => {

  const { windowChoice } = await browser.storage.sync.get('windowChoice');
  await goToBrace(windowChoice);
});
