let recogniser;
let summaryreq = undefined;

const app_state = Object.freeze(
    {"entry": 0, "loading": -1, "summary": 2, "history": 3});

function deleteEntry(index) {
  let elmSummaryHolder = document.getElementById('record-holder');
  let localDBStr = localStorage.getItem('storage');
  if (localDBStr == null || localDBStr.trim().length === 0) {
    localDBStr = "[]";
  }

  let localDB = JSON.parse(localDBStr);
  if (index > -1) {
    localDB.splice(index, 1);
  }

  localStorage.setItem('storage', JSON.stringify(localDB));
  updateHistoryView(elmSummaryHolder, localDB);
}

function updateHistoryView(elmSummaryHolder, localDB) {
  elmSummaryHolder.innerHTML = '';

  function toggleHeight(element) {
    console.log(element);
    let height = element.style.height;

    if (height === '100px') {
      element.style.height = 'fit-content';
    } else {
      element.style.height = '100px';
    }

  }

  for (var i=0; i<localDB.length; i++) 
  {
    let record = localDB[i];
    let ts = new Date(record.ts);
    let elm = document.createElement('div');
    elm.classList.add('col');

    let dateElm = document.createElement('div');
    dateElm.classList.add('row');
    dateElm.innerHTML = ts.getDate() + '-' + ts.getMonth() + '-'
        + ts.getFullYear() + ', ' + ts.getHours() + ":"
        + ts.getMinutes() + " <i onclick='deleteEntry(" + i + ")' style='margin-left: 1em; padding-top:2px' class='fa fa-trash' aria-hidden='true'></i>";

    let summaryElm = document.createElement('div');
    summaryElm.classList.add('row');
    summaryElm.style.color = '#0000FF';
    summaryElm.innerText = record.summary;

    let sourceElm = document.createElement('div');
    sourceElm.classList.add('row');
    sourceElm.style.textOverflow = 'ellipsis';
    sourceElm.style.overflow = 'hidden';
    sourceElm.style.height = '100px';
    sourceElm.onclick = ((event) => {
      toggleHeight(sourceElm);
    })

    sourceElm.innerText = record.original;

    elm.appendChild(dateElm);
    elm.appendChild(summaryElm);
    elm.appendChild(sourceElm);

    let breaker = document.createElement('hr');
    breaker.classList.add('col-10');

    elmSummaryHolder.prepend(breaker);
    elmSummaryHolder.prepend(elm);
  };
}

function summarizeText(userInput, UUID, updateCallback) {
  console.log('making summary request');

  summaryreq = $.ajax({
    url: '/summary',
    type: "post",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      "model": 'model',
      "num_words": 30,
      "num_beams": 3,
      "recognized_text": userInput,
      "uuid": UUID
    }),
    beforeSend: () => {
    },
    complete: () => {
    }
  }).done((jsonData) => {
    console.log(jsonData);
    updateCallback(userInput, jsonData.summarized_text);
  }).fail((jsonData) => {
    updateCallback(userInput, '');
    alert(jsonData['responseJSON']['message']);
  });
}



window.onload = function () {
  const AUTO_SUMMARIZE_TIMER = 500; // set the auto-summarizing time in milliseconds
  const MIN_TEXT_LENGTH = 10; // minimum number of words in input

  //
  // this is a super-hacky way to remove the input hint (not proud of it)
  // do this as eraly as possible
  //
  let finalText = document.getElementById('finaltext');
  let interrimText = document.getElementById('interrimtext');

  let firstfocus = true;
  finalText.onfocus = function() {
    if (firstfocus) {
      interrimText.innerText = '';
      firstfocus = false;
    }
  }

  let recordButton = document.getElementById('btn-recorder');
  let recordHint = document.getElementById('hint-recorder');
  let btnSave = document.getElementById('btn-save');
  let progressBar = document.getElementById('progress-bar');
  //let lblCounter = document.getElementById('counter');

  let localDBEntry = {original: '', summary: '', ts: Date()}; // temporary store db record while auto summary process is executing.
  let viewSpeak = document.getElementById('input-view');
  let viewSummary = document.getElementById('summary-view');
  let viewAllSummary = document.getElementById('all-summary-view');
  let viewWait = document.getElementById('waiting-view');
  let elmSummaryHolder = document.getElementById('record-holder');
  let elmSummary = document.getElementById('summary-elm');
  let elmSpinner = document.querySelector('#spinner');
  let elmWordCount = document.querySelector('#wordcount');
  let elmMaxWords = document.querySelector('#maxwords');
  let elmProgress = document.querySelector('#barfill');

  //
  // save a copy the content of those for resetting later
  //
  let finalTextChilds  = Array.prototype.slice.call(finalText.childNodes);
  let elmSummaryChilds = Array.prototype.slice.call(elmSummary.childNodes);

  let views = {
    entry: viewSpeak,
    summary: viewSummary,
    history: viewAllSummary,
    waiting: viewWait
  };

  localStorage.setItem('uuid',
    localStorage.getItem('uuid') || create_UUID());
  let UUID = localStorage.getItem('uuid');

  updateHistoryView(elmSummaryHolder, 
    JSON.parse(localStorage.getItem('storage')  || '[]'));

  btnSave.onclick = function (event) {
    if (finalText.innerText.trim().length > 0) {
      //
      // reload since might have changed by a deletion
      // XXX yeyeyes very bad
      //
      localDB = JSON.parse(localStorage.getItem('storage')  || '[]');

      localDBEntry.summary = elmSummary.innerText;
      localDBEntry.original = finalText.innerText;
      localDB.push(localDBEntry);
      localStorage.setItem('storage', JSON.stringify(localDB));
    }

    updateHistoryView(elmSummaryHolder,
     JSON.parse(localStorage.getItem('storage')  || '[]'));

    //@TODO: reset forms clear other objects

    //
    // remove all childNodes that were not present on page load.
    // XXX: should also add the orignal nodes again if missing
    //
    for(let i=0; i < finalText.childNodes.length;  i++)
      if ( finalTextChilds.indexOf(finalText.childNodes[i]) == -1 )
        finalText.childNodes[i--].remove()

    for(let i=0; i < elmSummary.childNodes.length;  i++)
      if ( elmSummaryChilds.indexOf(elmSummary.childNodes[i]) == -1 )
        elmSummary.childNodes[i--].remove()

    elmWordCount.innerText = 0;
    elmMaxWords.innerText = 0;
    elmProgress.style.width = '0%';
    localDBEntry = {original: '', summary: '', ts: Date()};

    // and move the carousel, weeee, ehem flip the page
    $('#mydiary').carousel('next');
  }

  let timerid = -1;
  function triggerSummary() {
    let text = document.getElementById('finaltext').innerText;
    let count = count_word(text);

    /*
     * XXX ugly, but see the start, this for hiding the hint, which will
     * get overriden when an interrim result is there.
     */
    firstfocus = false;

    /*
     * quick hack for the wordcount
     */
    elmWordCount.innerText = count.words;
    elmMaxWords.innerText = Math.max(count.words, 1000);
    elmProgress.style.width = '' + 100 * (Math.min(count.words, 1000) /
                                          Math.max(count.words, 1000)) + '%';

    /*
     * on timeout start the summary request, restart the timer on every call.
     */
    if (count.words < MIN_TEXT_LENGTH)
      return;

    /*
     * cancel any pending request
     */
    try { summaryreq.abort(); }
    catch(e) {}

    /*
     * restart the timer for posting a requst
     */
    clearTimeout(timerid);
    timerid = setTimeout(function() {
       summarizeText(text, UUID, function(original, summary) {
        localDBEntry.ts = new Date();
        elmSummary.childNodes[0].textContent = summary;

        // hide the spinner
        btnSave.disabled = false;
        elmSpinner.style.visibility = 'hidden';
       });

       // show the spinner and disable save
       btnSave.disabled = true;
       elmSpinner.style.visibility = 'visible';
    }, AUTO_SUMMARIZE_TIMER);
  };

  //
  // either on a change via voice or keyboard input, a summary call is triggered
  //
  try { initSpeech(interrimText, finalText, recordButton, recordHint, triggerSummary); }
  catch(e) {
    document.querySelector('#btn-recorder').disabled = true;
    document.querySelector('#hint-recorder').innerText = ' Chrome Only.';
  }
  finalText.oninput = triggerSummary;
}


function initSpeech(interrimText, finalText, recordButton, recordHint, onchange) {
  /*
   * prepare speech recognition, interrimText will be updated with intermediate
   * results. finalText once recognition is finalized, recordButton to toggles
   * start/stop and onchange will be called on a intermediate or final change.
   */

  recogniser = new webkitSpeechRecognition();
  recogniser.continuous = false;
  recogniser.interimResults = true;

  recogniser.onstart = function(event) {
    recordHint.innerText = ' Tap to pause';
    recordHint.className = 'fa fa-microphone-slash';
    recordButton.onclick = stopRecognising;
  }

  recogniser.onresult = function(event) {
    let latest = event.results[event.results.length-1][0];
    interrimText.innerHTML = latest.transcript;

    try { onchange(latest.transcript); }
    catch(e) {}
  }

  recogniser.onend = function(event) {
    // if interim is more than whitespace do add
    if (interrimText.innerText.trim().length > 0) {
      let txt = interrimText.innerText;
      txt = txt.charAt(0).toUpperCase() + txt.slice(1);

      // XXX this is hardcoded and will likely break
      finalText.childNodes[0].textContent =
        finalText.childNodes[0].textContent 
        + ' ' + txt + '. ';

      interrimText.innerText = '';

      try { onchange(finalText.innerText); }
      catch(e) {}
    }

    // restart if user did not ask for stopping the recognition
    if (recogniser.userStop) {
      recordHint.innerText = ' Tap to Speak';
      recordHint.className = 'fa fa-microphone';
      recordButton.onclick = startRecognising;
      console.log("stop speech recognition");
    } else
      recogniser.start();
  }
}

function startRecognising() {
  recogniser.userStop = false;
  recogniser.start();
}

function stopRecognising() {
  recogniser.userStop = true;
  recogniser.stop();
}

function updateView(state, views) {
  switch (state) {
    case app_state.summary:
      views.summary.style.display = 'block';
      views.entry.style.display = 'none';
      views.history.style.display = 'none';
      views.waiting.style.display = 'none';
      break;

    case app_state.history:
      views.summary.style.display = 'none';
      views.entry.style.display = 'none';
      views.history.style.display = 'block';
      views.waiting.style.display = 'none';
      break;

    case app_state.loading:
      views.summary.style.display = 'none';
      views.entry.style.display = 'none';
      views.history.style.display = 'none';
      views.waiting.style.display = 'block';
      break;

    case app_state.entry:
      views.entry.style.display = 'block';
      views.waiting.style.display = 'none';
      views.summary.style.display = 'none';
      views.history.style.display = 'none';

  }
}


function create_UUID() {
  console.log('creating new UUID');
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function count_word(val) {
  let wom = val.match(/\S+/g);
  return {
    words: wom ? wom.length : 0
  };
}
