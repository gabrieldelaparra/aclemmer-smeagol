package edu.umw.cs.smeagol.operation;

import java.util.Map;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.http.HttpResponse;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.model.*;


public class AbstractHTTPOperation implements IOperation {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public IResponse execute(Map<String, String> params) throws OperationException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    protected String makeHTTPGetRequest(String url) throws OperationException {
        HttpClient httpclient = new DefaultHttpClient();
        HttpContext localContext = new BasicHttpContext();
        HttpGet httpget = new HttpGet(url);

        HttpResponse httpResponse;
        InputStream is = null;
        String responseBody = null;

        logger.info("Request: {}", url);

        try {
            httpResponse = httpclient.execute(httpget, localContext);
            is = httpResponse.getEntity().getContent();
            responseBody = convertStreamToString(is);
            int statusCode = httpResponse.getStatusLine().getStatusCode();

            logger.info("Response status code: {}", statusCode);
            logger.info("Response body:{}", responseBody);

            if (statusCode != 200 && statusCode != 304) {
                throw new OperationException("Error communicating with server, status code= " + statusCode);
            }

        } catch (Exception ex) {
            logger.error("{}", ex);
            throw new OperationException("Error communicating with server: " + ex.getMessage());
        }
        httpclient.getConnectionManager().shutdown();

        return responseBody;
    }

    
    protected String convertStreamToString(InputStream is) throws IOException {
        if (is != null) {
            StringBuilder sb = new StringBuilder();
            String line;

            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
            } finally {
                is.close();
            }
            return sb.toString();
        } else {
            return "";
        }
    }

}
