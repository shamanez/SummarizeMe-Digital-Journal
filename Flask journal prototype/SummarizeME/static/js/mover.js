const data = [];
const token = "";

let affectiveSummary = true;
let newsSummary = true;
let spanner;


jQuery(document).ready(() => {
  const slider = $('#max_words');
  spanner = document.getElementById('spanner');
  slider.on('change mousemove', () => {
    $('#label_max_words').text('# words in summary: ' + slider.val())
  })
  toggleIndicator();

  const slider2 = $('#num_beams');
  slider2.on('change mousemove', () => {
    $('#label_num_beams').text('# beam search: ' + slider2.val())
  })

  $('#btn-summary').on('click', () => {
    affectiveSummary = false;
    newsSummary = false;
    toggleIndicator();

    let recognized_text = $('#recognised-textarea').val();

    let model = 'Dev-BART';
    let num_words = $('#max_words').val();
    let num_beams = 4;
    $.ajax({
      url: '/summary',
      type: "post",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        "model": model,
        "num_words": num_words,
        "num_beams": num_beams,
        "recognized_text": recognized_text,
      }),
      beforeSend: () => {
        $('.overlay').show()
      },
      complete: () => {
        $('.overlay').hide()
        affectiveSummary = true;
        toggleIndicator();
      }
    }).done((jsonData) => {
      console.log(jsonData);
      $('#note-affective-summary').val(jsonData['summarized_text']);
    }).fail((jsonData) => {
      alert(jsonData['responseJSON']['message']);
    });

    model = 'News-BART';
    $.ajax({
      url: '/summary',
      type: "post",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        "model": model,
        "num_words": num_words,
        "num_beams": num_beams,
        "recognized_text": recognized_text,
      }),
      beforeSend: () => {
        $('.overlay').show()

      },
      complete: () => {
        $('.overlay').hide()
        newsSummary = true;
        toggleIndicator();

      }
    }).done((jsonData) => {
      console.log(jsonData)
      $('#note-news-summary').val(jsonData['summarized_text'])

    }).fail((jsonData) => {
      alert(jsonData['responseJSON']['message'])

    });
  })

})



let toggleIndicator = function () {
  let complete = affectiveSummary && newsSummary;
  if (complete) {
    spanner.style.display = 'none';
  } else {
    spanner.style.display = 'inline-block';
  }
  console.log('indicator: ' + complete);
}