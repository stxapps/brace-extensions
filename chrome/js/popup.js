const onClick = async (e) => {
  const windowChoice = e.currentTarget.dataset.windowChoice;
  await chrome.runtime.sendMessage({ type: 'GO_TO_BRACE', payload: windowChoice });
  window.close();
};

document.querySelector("#window-choice-1").addEventListener('click', onClick);
document.querySelector("#window-choice-2").addEventListener('click', onClick);
document.querySelector("#window-choice-3").addEventListener('click', onClick);
