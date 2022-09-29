---
comments: true
---
<style>
/*** hide secondary sidbar ***/
.md-sidebar--secondary:not([hidden]) {
    display: none;
}
</style>
# gitstalk - beiklive
[阅读原文](https://gitstalk.netlify.app/beiklive)  
<iframe id='inner-html' style='width:100%' src="https://gitstalk.netlify.app/beiklive" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
<script>
    // expand content
    $(document).ready(function(){
        setInterval(()=>{
            $('#inner-html').css('height', $('#inner-html').prop('contentWindow').document.body.scrollHeight);
        }, 0);
    })
</script>
