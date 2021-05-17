/* ****************** 글로벌 설정 ******************** */
var auth = firebase.auth();     // firebase의 auth(인증)모듈을 불러온다.
var googleAuth = new firebase.auth.GoogleAuthProvider();        // firebase에서 제공하는 구글 로그인 모듈을 불러온다.
var db = firebase.database();       // firebase의 database 모듈을 불러온다.
var user = null;

var $tbody = $('.list-wrapper tbody')




/* ****************** 사용자 함수 ******************** */
$tbody.empty();


/* ****************** 이벤트 등록 ******************** */
auth.onAuthStateChanged(onChangeAuth);
db.ref('/root/board').on('child_added', onAdded);       // limitToLast(10): root안에 저장된 게시글들 중 최근 글 10개를 지정함
// db.ref('/root/board').on('child_removed', onRemoved);

$('.bt-login').click(onLogin);
$('.bt-logout').click(onLogOut);


/* ****************** 이벤트 콜백 ******************** */
function onRemoved(){

}

function onAdded(r){
    var k = r.key;
    var v = r.val();
    var i = $tbody.find('tr').length+1;
    var html = '';
    html += '<tr id="'+k+'">';
    html += '<td>'+i;
    html += '<div class="mask-td">';        // 번호 안에 넣어서 absolute로 띄움
    html += '<button class="btn btn-sm btn-success">수정</button>';
    html += '<button class="btn btn-sm btn-danger">삭제</button>';
    html += '<button class="btn btn-sm btn-primary">내용보기</button>';
    html +='</div>';
    html +='</td>';
    html += '<td class="text-left">'+v.content+'</td>';
    html += '<td>'+v.writer+'</td>';
    html += '<td>'+moment(v.createdAt).format('YYYY-MM-DD')+'</td>';
    html += '<td>'+v.readnum+'</td>';
    html += '</tr>';
    $tbody.prepend(html);
    $(window).resize(function(){
        var wid = $('.list-td').outerWidth();       // 그리고 테이블의 넓이값을 가져와서
        $('.mask-td').innerWidth(wid);      // mask-td의 inner-width값으로 넣어주고
    }).trigger('resize');       // resize할때마다 넓이 값을 조정
}

function onSubmit(f){
    if(f.writer.value.trim()===''){     // trim : 문자열 양 끝의 공백을 없애줌
        alert('작성자는 필수사항 입니다.');
        f.writer.focus();
        return false;
    }
    if(f.content.value.trim()===''){
        alert('한 줄 내용은 필수사항 입니다.');
        f.content.focus();
        return false;
    }

    var data = {
        writer: f.writer.value,
        content: f.content.value,
        createdAt: new Date().getTime(),
        uid: user.uid,
        readnum: 0
    }
    if(user && user.uid)db.ref('root/board/').push(data);       // user와 uid가 있다면 firebase의 realtime Database로 보내줌
    else alert('정상적인 접근이 아닙니다.');

    f.content.value = '';
    f.content.focus();

    return false;
}

function onChangeAuth(r){
    user = r;
    console.log(r);
    if(user) {      // user값(r값) 이 있다면
        $('.header-wrapper .email').text(user.email)
        $('.header-wrapper .photo img').attr('src', user.photoURL)
        $('.header-wrapper .info-wrap').css('display', 'flex');
        $('.create-wrapper input[name="writer"]').val(user.displayName);
        $('.create-wrapper').show();
        $('.bt-login').hide();
        $('.bt-logout').show();
    }else{
        $('.header-wrapper .email').text('')
        $('.header-wrapper .photo img').attr('src', '//via.placeholder.com/1x1/333')
        $('.header-wrapper .info-wrap').css('display', 'none');
        $('.create-wrapper input[name="writer"]').val('');
        $('.create-wrapper').hide();
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



