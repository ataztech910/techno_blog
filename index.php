<!DOCTYPE html>
<html>
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            font-family: 'Raleway', sans-serif;
        }
        .Article {
            display: block;
            justify-content: space-between;
            cursor: pointer;
            transition: 0.5s;
            margin-bottom: 1rem;
        }
        .Article__image img{
            width: 50px;
        }
        .ArticleElement__header {
            text-align: center;
            font-family: 'Roboto Slab', serif;
            padding: 1rem;
        }
        figure {
            padding: 0;
            text-align: center;
            position: relative;
            margin-bottom: 1rem;
        }
        figure img {
            width: 100%;
        }
        figcaption {
            color: #79828B;
            text-align: center;
            font-size: 12px;
        }
        p {
            margin: 0 21px 12px;
            word-wrap: break-word;
        }
    </style>
</head>
<body>

<?php

define("AUTHOR_NAME_STRING", "Author");
define("IMAGE_PATH", "https://telegra.ph/");

$serverUri = $_SERVER['REQUEST_URI'];
$isArticle = strpos($serverUri, "article");

abstract class Page
{
    const Main = 0;
    const Article = 1;
}

$token = "82efcc10b1130d28d1b82449cf9237f0aad19dd3d89547b62c00e4984445";

if ($isArticle) {
    $serverUri = "article";
}

switch($serverUri) {
    case "/":
        $url = "https://api.telegra.ph/getPageList?access_token=".$token;
        $page = Page::Main;
        break;
    case "article":
        $urlPieces = explode("/",  $_SERVER['REQUEST_URI']);
        $url = "https://api.telegra.ph/getPage/".$urlPieces[2]."?return_content=true";
        $page = Page::Article;
        break;    
    default:
        $url = "https://api.telegra.ph/getPageList?access_token=".$token;
        $page = Page::Main;
}

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

$resp = curl_exec($curl);
curl_close($curl);

if ($resp) {
    $result = json_decode($resp, true);
    
    if ($page == Page::Main) {
    ?>
        <div class="ArticlesList">
            <div><h1>Articles list</h1></div>
            <?php
                foreach ($result["result"]["pages"] as $article) {
                    ?>
                    <div class="Article">
                        <a href="/article/<?php echo $article["path"]; ?>">
                            <div class="Article__image">
                                <img src="<?php echo $article["image_url"]; ?>" alt="<?php $article["title"]; ?>" />
                            </div>
                            <div><?php echo $article["title"]; ?></div>
                        </a>
                        <div>
                            <?php echo $article["description"]; ?>
                        </div>
                    </div>
                    <?php
                }
           
            ?>
        </div>
        <?php  } ?>

    <?php
    
            function compileTag($tag) {
                $compiled = $tag;
                if(gettype($tag) !== "string") {
                    switch ($tag["tag"]) {
                        case "img":
                            $compiled = "<img src=".IMAGE_PATH.$tag["attrs"]["src"]." />";
                            break;
                        case "figcaption":
                            $compiled = "<".$tag["tag"].">".$tag["children"][0]."</".$tag["tag"].">";
                            break;
                        case "br":
                            $compiled = "<".$tag["tag"]." />";
                            break;
                        default:
                            $compiled = $tag;
                    }
                }
                return $compiled;
            }    

            function compileContent($node) {
                $compiled = "<".$node["tag"].">";
                foreach($node["children"] as $child) {
                    $compiled .= compileTag($child);
                }
                $compiled .= "</".$node["tag"].">";
                return $compiled;
            }

           if ($page == Page::Article) {
                ?>
                <div class="ArticleElement">
                    <div class="ArticleElement__header">
                        <h1><?php echo $result["result"]["title"]; ?></h1>
                        <div class="ArticleElement__author">
                            <span class="ArticleElement__author__title"><?php echo AUTHOR_NAME_STRING; ?>: </span>
                            <a href="<?php echo $result["result"]["author_url"]; ?>" target="_blank"><?php echo $result["result"]["author_name"]; ?></a>
                        </div>
                    </div>
                    <div class="ArticleElement__content">
                        <?php 
                            foreach($result["result"]["content"] as $content) {
                                echo compileContent($content);
                            }
                        ?>
                    </div>
                </div>
        <?php } ?>            

    <?php } ?>

</body>
</html>
