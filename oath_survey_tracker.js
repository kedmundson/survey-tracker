// Use local storage to track responses to a survey in which the $options each
// have a data-model-id with a value that corresponds to a response in English.
;(function($, undefined){

  var tracker = null;

  OATHSurveyTracker = {

    init: function(slideLabel) {
      tracker = this;
      tracker.obj = {};
      tracker.modelId = '';
      tracker.savedData = '';

      tracker.slide = slideLabel;
      tracker.slideLabel = 'OATH Slide';
      tracker.userLabel = 'OATH User';
      tracker.$options = $('.slide-object.slide-object-vectorshape.shown.cursor-hover');
      tracker.$options.click(tracker.track);
      tracker.$download = $('#oath-download-results');
      tracker.$download.click(tracker.downloadResults);
      tracker.$reset = $('#oath-reset-results');
      tracker.$reset.click(tracker.resetResults);
      console.log('Tracker is initialized');
    },

    cleanResults: function(allUsers) {

      var acceptableVals = {
          'Upset': ['5esusg6U6Qc', '6Mz3OevorUF'], 
          'Fine': ['5avzG0yaWiv', '61JBYae3h2j'],
          'Frustrated': ['6GYOx6gmZQb', '5xszm3SbT5r'],
          'Good': ['6bHx4i2im0z', '6Eh2oFM3V1n'],
          'Confused': ['5jZANIxd8Wu', '6oy8sEPM3oJ'],
          'Skip this question': ['6lvtx31Vwl0', '6DHSSvwPlk0'],
          'Yes': ['5h6zZ4Fyzg3'],
          'No, I already knew most of it': ['5ejMWjtldqE'],
          'A little, but I still have questions': ['66xHNFBP7tN'],
        };

      for (var user in allUsers) {
        for (var response in allUsers[user]) {
          var remove = true;

          for (var englishVal in acceptableVals) {
            if (acceptableVals[englishVal].indexOf(allUsers[user][response]) > -1) {
              allUsers[user][response] = englishVal;
              remove = false;
            }
          }

          if (remove) {
            delete allUsers[user][response];
          }

        }
      }

      return allUsers;
    },

    clearStorage: function() {
      if (localStorage) {
        var i = 0;

        while (i < localStorage.length) {
          key = localStorage.key(i);

          if (key.indexOf(tracker.userLabel) > -1) {
            localStorage.removeItem(key);
          } else {
            i++;
          }
        }
      }
      console.log('OATH survey results have been reset.');
    },

    displayResults: function() {
      console.log(tracker.getResults());
    },

    downloadResults: function() {
      var results = tracker.getResults(),
          headerRow = ["User", "First Question", "Second to Last Question", "Last Question"],
          csvContent = "data:text/csv;charset=utf-8,";

      if (tracker.isEmpty(results)) {
        alert('No results for this computer!');
      } else {
        csvContent += headerRow + "\r\n"; // add carriage return

        for (var user in results) {
          var row = ['"' + user + '"'];
          for (var slide in results[user]) {
            row.push('"' + results[user][slide] + '"');
          }
          row = row.join(',');
          csvContent += row + "\r\n";
        }

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
      }
    },

    fetchUsers: function(allUsers) {
      var key;

      if (localStorage) {
        for (var i = 0; i < localStorage.length; i++) {
          key = localStorage.key(i);

          if (key.indexOf(tracker.userLabel) > -1) {
            var slideResults = localStorage.getItem(key);
            allUsers[key] = JSON.parse(slideResults);
          }

        }
      }

      return allUsers;
    },

    getResults: function() {
      var allUsers = {},
          results;

      allUsers = tracker.fetchUsers(allUsers);
      results = tracker.cleanResults(allUsers);
      return results;
    },

    isEmpty: function(obj) {
      for(var key in obj) {
        if(obj.hasOwnProperty(key))
          return false;
      }
      return true;
    },

    resetResults: function() {
      var yesReset = confirm("Are you sure you want to reset all the survey results for this computer? This can't be undone.");
      if (yesReset) {
        tracker.clearStorage();
        alert('Results for this computer have been cleared!');
      }
      tracker.setUser();
    },

    setUser: function() {
      var key,
          user,
          users = [],
          randomStr = ' - ' + Math.random().toString(36).substring(2, 15);

      if (localStorage) {
        for (var i = 0; i < localStorage.length; i++) {
          key = localStorage.key(i);

          if (key.indexOf(tracker.userLabel) > -1) {
            users.push(key);
          }
        }
      }

      tracker.user = tracker.userLabel + ' ' + (users.length + 1) + randomStr;
    },

    track: function(e) {
      tracker.modelId = $(this).attr('data-model-id');
      console.log('User clicked: ' + tracker.modelId);

      if (localStorage) {
        tracker.savedData = localStorage.getItem(tracker.user);

        if (tracker.savedData) {
          tracker.obj = JSON.parse(tracker.savedData);
        }

        tracker.obj[tracker.slide] = tracker.modelId;
        localStorage.setItem(tracker.user, JSON.stringify(tracker.obj));
      }

    },

  }

  // One file load, init once and then set this session's user
  OATHSurveyTracker.init();
  OATHSurveyTracker.setUser();

})(jQuery);
