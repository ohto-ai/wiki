if(document.domain.endsWith('github.io'))
{
    $('a[href$="#only-github-io"]').css('display', 'none')
    $('img[src$="#only-github-io"]').css('display', 'none')
    $('a[href$="#only-github-io-with-parent"]').parent().css('display', 'none')
    $('img[src$="#only-github-io-with-parent"]').parent().css('display', 'none')
}
else
{
    $('a[href$="#not-github-io"]').css('display', 'none')
    $('img[src$="#not-github-io"]').css('display', 'none')
    $('a[href$="#not-github-io-with-parent"]').parent().css('display', 'none')
    $('img[src$="#not-github-io-with-parent"]').parent().css('display', 'none')
}