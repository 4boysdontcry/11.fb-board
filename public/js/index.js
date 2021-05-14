/* ****************** 글로벌 설정 ******************** */
var auth = firebase.auth();     // firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider();        // firebase에서 제공하는 구글 로그인 모듈을 불러온다.
var user = null;


/* ****************** 사용자 함수 ******************** */



/* ****************** 이벤트 등록 ******************** */
auth.onAuthStateChanged(onChangeAuth);

$('.bt-login').click(onLogin);
$('.bt-logout').click(onLogOut);


/* ****************** 이벤트 콜백 ******************** */
function onChangeAuth(r){
    user = r;
    console.log(r);
    if(user) {
        $('.header-wrapper .email').text(user.email)
        $('.header-wrapper .photo img').attr('src', user.photoURL)
        $('.header-wrapper .info-wrap').css('display', 'flex');
        $('.bt-login').hide();
        $('.bt-logout').show();
    }else{
        $('.header-wrapper .email').text('')
        $('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333')
        $('.header-wrapper .info-wrap').css('display', 'none');
        $('.bt-logout').hide();
        $('.bt-login').show();
    }
}

function onLogOut(){
    auth.signOut();
}

function onLogin(){
    auth.signInWithPopup(googleAuth);
}



