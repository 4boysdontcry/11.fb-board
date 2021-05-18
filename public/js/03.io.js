var numSteps = 20.0;

var boxElement;
var prevRatio = 0.0;
var increasingColor = "0deg"; // 스크롤이 올라감에 따라 보이기 시작할 때
var decreasingColor = "90deg"; // 스크롤이 내려감에 따라 사라지기 시작할 때
var section = $("section").eq(1)[0];
createObserver();

function createObserver() {
	var observer;
	var options = {
		root: null,
		rootMargin: "0px",
		threshold: buildThresholdList()
	};

	observer = new IntersectionObserver(onIntersection, options);
	observer.observe(section);
}

function buildThresholdList() {
	var thresholds = [];
	var numSteps = 20;

	for (var i = 1.0; i <= numSteps; i++) {
		var ratio = i / numSteps;
		thresholds.push(ratio);
	}

	thresholds.push(0);
	return thresholds;
}

function onIntersection(entries, observer) {
    entries.forEach(function(v) {
		if (v.intersectionRatio > prevRatio) {
            var deg = v.intersectionRatio * 90;
			$('.box').css('transform','rotateX('+deg+'deg)')
		}
        else{
            
            var deg = v.intersectionRatio * 90;
            $('.box').css('transform','rotateX('+deg+'deg)')
        }
		prevRatio = v.intersectionRatio;
	});
}