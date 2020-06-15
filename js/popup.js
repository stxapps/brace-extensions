const onClick = async (e) => {

  const windowChoice = e.currentTarget.dataset.windowChoice;
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  console.log(`windowChoice: ${windowChoice}`);
  console.log(`Current tab url: ${tab.url}`);

  if (!tab.url || tab.url === 'about:blank') return;

  let url = new URL(tab.url);
  if (windowChoice === 'new_window') {
    url.searchParams.append('brace-dot-to-show-close', 'window');
  }
  url = 'https://brace.to/' + url.toString();

  if (windowChoice === 'current_tab') {
    browser.tabs.update({ url: url });
  } else if (windowChoice === 'new_tab') {
    browser.tabs.create({ url: url });
  } else if (windowChoice === 'new_window') {
    browser.windows.create({
      allowScriptsToClose: true,
      width: 384,
      height: 512,
      type: 'popup',
      url: url
    });
  } else {
    console.log('Invalid windowChoice');
  }

  window.close();
};

document.querySelector("#window-choice-1").addEventListener('click', onClick);
document.querySelector("#window-choice-2").addEventListener('click', onClick);
document.querySelector("#window-choice-3").addEventListener('click', onClick);
