package com.prologue.ballife.util;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.*;
import org.xml.sax.InputSource;

import lombok.extern.slf4j.Slf4j;
import java.io.StringReader;

@Slf4j
public class MediApiXMLParser {
    public static String toPlainText(String xml) {
        if(xml == null || xml.isBlank()) return null;
        try{
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            //XXE 공격 방어용 코드
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xml)));

            StringBuilder sb = new StringBuilder();
            NodeList articles = doc.getElementsByTagName("ARTICLE");

            for(int i = 0; i < articles.getLength(); i++){
                Element article = (Element) articles.item(i);
                String articleTitle = article.getAttribute("title");
                if (articleTitle != null && articleTitle.isBlank()){
                    if(sb.length() > 0) sb.append("\n");
                    sb.append("■ ").append(articleTitle).append("\n");
                }
                NodeList paragraphs = article.getElementsByTagName("PARAGRAPH");
                for (int j = 0; j < paragraphs.getLength(); j++) {
                    String text = paragraphs.item(j).getTextContent();
                    if (text != null && !text.isBlank()) {
                        sb.append(text.trim()).append("\n");
                    }
                }
            }

            if(articles.getLength() == 0){
                NodeList paragraphs = doc.getElementsByTagName("PARAGRAPH");
                for(int i = 0; i < paragraphs.getLength(); i++){
                    String text = paragraphs.item(i).getTextContent();
                    if(text != null && !text.isBlank()){
                        sb.append(text.trim()).append("\n"); 
                    }
                }
            }

            return sb.toString().trim();
        } catch (Exception e){
            log.error("XML 파싱 실패", e);
            return xml;
        }
    }
}
