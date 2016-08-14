(function () {
    var streamingDays = [1, 2, 3, 4, 5]; // monday - friday
    var streamingStart = 8;
    var streamingEnd = 16; // at 16:00 the timer will be displayed again
    var online = true;
    $(window).on('load', function () {
        checkForOnline();
    });
    function getNextStream() {
        var now = new Date();
        var nextStream = now;
        // stream is currently running
        if ($.inArray(now.getDay(), streamingDays) > -1 && now.getHours() >= streamingStart && now.getHours() < streamingEnd) {
            // don't show the timer
        } else {
            for (var i = 0; i < 7; i++) {
                if (i > 0) {
                    now.setTime(now.getTime() + 86400000);                    
                }
                var day = now.getDay();
                // if today is the next stream
                if ($.inArray(day, streamingDays) > -1 && (now.getHours() < streamingStart || i > 0)) {
                    nextStream = now;
                    nextStream.setHours(streamingStart);
                    nextStream.setMinutes(0);
                    nextStream.setSeconds(0);
                    break;
                }
            }
        }
        return nextStream;
    }
    function checkForOnline() {
        if (online === false && $('.twitch-status-tag').hasClass('twitch-online')) {
            startCountDown(new Date());
            online = true;
        }
        else if (online === true && $('.twitch-status-tag').hasClass('twitch-offline')) {
            var nextStream = getNextStream();
            startCountDown(nextStream);
            online = false;
        }
        setTimeout(checkForOnline, 500);
    }
    function startCountDown(nextStream) {
        var labels = ['days', 'hours', 'minutes', 'seconds'],
            nextYear = (new Date().getFullYear() + 1) + '/01/01',
            currDate = '00:00:00:00:00',
            nextDate = '00:00:00:00:00',
            parser = /([0-9]{2})/gi,
            $example = $('#getting-started');
        $example.empty();
        // Parse countdown string to an object
        function strfobj(str) {
            var parsed = str.match(parser),
                obj = {};
            labels.forEach(function (label, i) {
                obj[label] = parsed[i]
            });
            return obj;
        }
        // Return the time components that diffs
        function diff(obj1, obj2) {
            var diff = [];
            labels.forEach(function (key) {
                if (obj1[key] !== obj2[key]) {
                    diff.push(key);
                }
            });
            return diff;
        }
        // Build the layout
        var initData = strfobj(currDate);
        labels.forEach(function (label, i) {
            var markup = '<div class="time ';
            markup += label;
            markup += '"><span class="count curr top">';
            markup += initData[label];
            markup += '</span><span class="count next top">';
            markup += initData[label];
            markup += '</span><span class="count next bottom">';
            markup += initData[label];
            markup += '</span><span class="count curr bottom">';
            markup += initData[label] + '</span><span class="label">';
            markup += (label.length < 6 ? label : label.substr(0, 3));
            markup += '</span></div>';
            $example.append(markup);
        });
        // Starts the countdown
        $example.countdown(nextStream, function (event) {
            var newDate = event.strftime('%d:%H:%M:%S'),
                data;
            if (newDate !== nextDate) {
                currDate = nextDate;
                nextDate = newDate;
                // Setup the data
                data = {
                    'curr': strfobj(currDate),
                    'next': strfobj(nextDate)
                };
                // Apply the new values to each node that changed
                diff(data.curr, data.next).forEach(function (label) {
                    var selector = '.%s'.replace(/%s/, label),
                        $node = $example.find(selector);
                    // Update the node
                    $node.removeClass('flip');
                    $node.find('.curr').text(data.curr[label]);
                    $node.find('.next').text(data.next[label]);
                    // Wait for a repaint to then flip
                    setTimeout(function () {
                        $node.addClass('flip');
                    }, 50);
                });
            }
        });
    }
})();