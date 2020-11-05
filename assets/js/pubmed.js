$("#btnSearch").click(function() {

    var term = $("#txtTerm").val();
    var database = $("#drpDatabase").val();
    var listUrl = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=" + database + "&term=" + term;

    if (term != "") {
        $.get(listUrl, function(listXml) {
            lDocElt = listXml.documentElement;
            $('#listContainer').empty();
            var Ids = lDocElt.getElementsByTagName("Id");
            var i = 0;
            $('#listContainer').append('<ul></ul>');
            while (i < Ids.length) {
                li = '<li class="click">' + Ids[i].textContent + '</li>';
                $('ul').append(li);
                i++;
            }
            $('.click').click(function() {

                var url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=" + $(this).text() + "&retmode=xml";

                $.get(url, function(detailXml) {

                    detailDocElt = detailXml.documentElement;
                    var ArticleTitles = detailDocElt.getElementsByTagName("ArticleTitle");
                    var ArticleText = ArticleTitles[0].textContent;

                    var Affiliation = detailDocElt.getElementsByTagName("Affiliation");
                    var aText = Affiliation[0].textContent;
                    //alert(aText.textContent);

                    var Authors = detailDocElt.getElementsByTagName("Author");
                    var authorCount = 0;
                    while (authorCount < Authors.length) {
                        li = li + '<li>' + Authors[authorCount].childNodes[2].textContent + ' ' + Authors[authorCount].childNodes[1].textContent + ' ' + Authors[authorCount].childNodes[0].textContent + '</li>';

                        authorCount++;
                    }

                    if ($('#detailContainer').children().length == 1) {
                        $('#detailContainer').append('<p>' + ArticleText + '</p><h4>Abstract</h4><p >' + aText + '</p><h4>Authors</h4><ul id="ulDetail">' + li + '</ul>');

                    } else {
                        $('#detailContainer').slideUp("fast", function() {
                            $('#detailContainer').empty().append('<p >' + ArticleText + '</p><h4>Abstract</h4><p>' + aText + '</p><h4>Authors</h4><ul id="ulDetail">' + li + '</ul>');

                        });

                    }
                    $('#detailContainer').slideDown("slow");

                });


            });

        });

    } else {

    }
});