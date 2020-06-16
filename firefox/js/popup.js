const onClick = async (e) => {
  const windowChoice = e.currentTarget.dataset.windowChoice;

  const bgPage = await browser.runtime.getBackgroundPage();
  await bgPage.goToBrace(windowChoice);

  window.close();
};

document.querySelector("#window-choice-1").addEventListener('click', onClick);
document.querySelector("#window-choice-2").addEventListener('click', onClick);
document.querySelector("#window-choice-3").addEventListener('click', onClick);
