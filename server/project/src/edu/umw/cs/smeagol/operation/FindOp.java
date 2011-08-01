package edu.umw.cs.smeagol.operation;

import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;

import org.apache.http.HttpResponse;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathFactory;
import javax.xml.xpath.XPathExpression;
import org.xml.sax.InputSource;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import edu.umw.cs.smeagol.model.*;
import edu.umw.cs.smeagol.model.finder.*;

public class FindOp extends AbstractHTTPOperation {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * Execute a Smeagol Finder operation.
     * @param   params  Map of operation parameters.
     *                  keyword: search term
     *                  count: number of results to return
     *                  offset: omit the first n results (like SPARQL offset)
     * @return  A FinderResponse object, containing information about
     *          the result list.
     */
    public IResponse execute(Map<String, String> params) throws OperationException {
        //Get parameters and build the query.
        if (!params.containsKey("keyword")) {
            throw new OperationException("Missing parameter 'keyword'");
        }
        if (!params.containsKey("offset")) {
            throw new OperationException("Missing parameter 'offset'");
        }
        if (!params.containsKey("count")) {
            throw new OperationException("Missing parameter 'count'");
        }

        String keyword = params.get("keyword");
        int offset = Integer.parseInt(params.get("offset"));
        int count = Integer.parseInt(params.get("count"));

        try {
            keyword = java.net.URLEncoder.encode(keyword, "UTF-8");
        } catch (UnsupportedEncodingException ex) {
            throw new OperationException("Could not encode query: " + ex.getMessage());
        }

        String query = "http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=";
        query += "&MaxHits=" + Integer.toString(offset + count);
        query += "&QueryString=" + keyword;
        String response = makeHTTPGetRequest(query);

        //Get data.
        FinderData data = new FinderData();
        try {
            parseXML(response, data, offset);
        }
        catch (OperationException oe) {
            throw oe;
        }

        //Get metadata.
        int totalCount = offset + count;
        Page page = new Page();
        page.setOffset(offset);
        page.setCount(data.getResults().size());
        page.setTotal(totalCount);
        Meta meta = new Meta();
        meta.setService("finder");
        meta.setClientID("");
        meta.setPage(page);

        //Build the response.
        FinderResponse result = new FinderResponse();
        result.setMeta(meta);
        result.setData(data);
        return result;
    }

    /**
     * Parses an XML response and adds the data to the FinderData
     * object.
     * @param   response    HTTP response in XML.
     * @param   data        FinderData object to build.
     * @param   offset      Skip the first n results.
     */
    void parseXML(String response, FinderData data, int offset) throws OperationException {
        Document doc;
        List<Result> results = new ArrayList<Result>();
        try {
            StringReader sr = new StringReader(response);
            InputSource is = new InputSource(sr);
            doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(is);

            XPath xpath = XPathFactory.newInstance().newXPath();
            XPathExpression resultXP = xpath.compile("/ArrayOfResult/Result");
            XPathExpression labelXP = xpath.compile("Label");
            XPathExpression uriXP = xpath.compile("URI");
            XPathExpression descXP = xpath.compile("Description");
            XPathExpression classesXP = xpath.compile("Classes/Class/Label");
            XPathExpression categoriesXP = xpath.compile("Categories/Category/Label");

            NodeList nodes = (NodeList) resultXP.evaluate(doc, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++) {
                //Skip the first <offset> nodes
                if (i < offset) {
                    continue;
                }

                Node node = nodes.item(i);
                String uri = (String) uriXP.evaluate(node, XPathConstants.STRING);
                String desc = (String) descXP.evaluate(node, XPathConstants.STRING);
                String label = (String) labelXP.evaluate(node, XPathConstants.STRING);
                NodeList classes = (NodeList) classesXP.evaluate(node, XPathConstants.NODESET);
                NodeList categories = (NodeList) categoriesXP.evaluate(node, XPathConstants.NODESET);

                Result r = new Result();
                r.setLabel(label);
                r.setUri(uri);
                r.setDescription(desc);

                for (int j = 0; j < classes.getLength(); j++) {
                    Node innerNode = classes.item(j);
                    r.addClass(innerNode.getTextContent());
                }

                for (int j = 0; j < categories.getLength(); j++) {
                    Node innerNode = categories.item(j);
                    r.addCategory(innerNode.getTextContent());
                }

                results.add(r);
            }
            data.setResults(results);
        }
        catch (Exception e) {
            throw new OperationException("Error parsing XML: " + e.toString());
        }
    }
}
