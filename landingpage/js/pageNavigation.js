/*

Static HTML page switcher, needs work but better than nothing
Should be replaced by React/Vue logics;

*/


var pages = ['#homepage', '#dashboard','#earn','#buy','#referrals','#ecosystem'];
var transitionSpeed = 200 // Transition speed between pages;
var url = window.location.href;
var domain = url.split("/")[3];
var currentPage = null;
if (domain.indexOf("#") !== -1) {
    if (domain.length > 1) {
        var contains = false;
        console.log(domain);
        switchPage(domain);
    } else {
        switchPage("#homepage");
    }
} else {
    switchPage("#homepage");
}

$('.page-controller').click(function (e) {
    var page = $(this).attr('page-to');
    switchPage(page)
})

function pageExists(domain) {
    for (var i = 0; i < pages.length; i++) {
        if (domain === pages[i]) {
            containsPage = true;
            return true;
        }
    }
    return false;
}
var notReady = false;


function switchPage(page) {
    if (notReady) {
        console.log("not ready")
        return;
    }

    if (currentPage == page) {
        console.log("We are already on this page");
        return;
    }

    notReady = true;
    console.log("switchPage() ")
    if (pageExists(page)) {
        if (currentPage != null) {
            console.log("we had a page, hiding.. " + currentPage)
            $(currentPage).fadeOut(transitionSpeed, function () {
                scrollToTop();
                // Animation complete.
                $(page).fadeIn(transitionSpeed, function () {
                    currentPage = page;
                    console.log("New page " + currentPage);
                    history.pushState({}, null, "/" + currentPage);
                    //needsReInit();
                    notReady = false;
                });
            })
            return;
        }
        $(page).fadeIn(transitionSpeed, function () {
            // $(page).show();
            scrollToTop();
            currentPage = page;
            console.log("New page " + currentPage);
            history.pushState({}, null, "/" + currentPage);
            //needsReInit();
            notReady = false
        });
    } else {
        if (currentPage != null) {
            console.log("we had a page, hiding.. " + currentPage)
            $(currentPage).hide();
        }
        $("#404_page").fadeIn(transitionSpeed, function () {
            scrollToTop();
            currentPage = "#404_page";
            console.log("New page " + currentPage);
            history.pushState({}, null, "/" + currentPage);
            //needsReInit();
            notReady = false
        });
    }

}

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function switchPageStatic(page) {
    console.log("switchPage() ")
    if (pageExists(page)) {
        if (currentPage != null) {
            console.log("we had a page, hiding.. " + currentPage)
            $(currentPage).hide();
        }
        $(page).show();
        currentPage = page;
        console.log("New page " + currentPage);
    } else {
        if (currentPage != null) {
            console.log("we had a page, hiding.. " + currentPage)
            $(currentPage).hide();
        }
        $("#404_page").show();
        currentPage = "#404_page";
        console.log("New page " + currentPage);
    }

}