document.addEventListener("DOMContentLoaded", async () => {
  const { windowChoice } = await chrome.storage.sync.get('windowChoice');

  if (windowChoice === 'current_tab') {
    document.querySelector('#window-choice-1').checked = true;
  } else if (windowChoice === 'new_tab') {
    document.querySelector('#window-choice-2').checked = true;
  } else if (windowChoice === 'new_window') {
    document.querySelector('#window-choice-3').checked = true;
  } else if (windowChoice === 'manual') {
    document.querySelector('#window-choice-4').checked = true;
  } else {
    throw new Error(`Invalid windowChoice: ${windowChoice}`);
  }

  console.log(`Selected radio button value: ${windowChoice}`);
});

const onClick = async (e) => {
  const windowChoice = e.target.value;
  await chrome.storage.sync.set({ windowChoice: windowChoice });

  const popupPage = windowChoice === 'manual' ? 'popup.html' : '';
  await chrome.action.setPopup({ popup: popupPage });

  console.log(`Updated storage: ${windowChoice} and popupPage: ${popupPage}`);
};

document.querySelector("#window-choice-1").addEventListener('click', onClick);
document.querySelector("#window-choice-2").addEventListener('click', onClick);
document.querySelector("#window-choice-3").addEventListener('click', onClick);
document.querySelector("#window-choice-4").addEventListener('click', onClick);
