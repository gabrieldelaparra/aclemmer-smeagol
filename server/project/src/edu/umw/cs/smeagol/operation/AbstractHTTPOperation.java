/******************************************************************************
    Smeagol
    Copyright (C) 2010-2011  Aaron Clemmer, Stephen Davies

    This file is part of Smeagol.

    Smeagol is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/
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
