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

import java.util.*;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3._2005.sparql_results.Sparql;
import org.w3._2005.sparql_results.Binding;

import edu.umw.cs.smeagol.config.SmeagolConfig;
import edu.umw.cs.smeagol.model.*;
import edu.umw.cs.smeagol.model.sparql.*;


public class SparqlQueryOp extends AbstractHTTPOperation {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public IResponse execute(Map<String, String> params) throws OperationException {
        if (!params.containsKey("query")) {
            throw new OperationException("Missing parameter 'query'");
        }
        if (!params.containsKey("offset")) {
            throw new OperationException("Missing parameter 'query'");
        }
        if (!params.containsKey("count")) {
            throw new OperationException("Missing parameter 'query'");
        }

        String query = params.get("query");
        int offset = Integer.parseInt(params.get("offset"));
        int count = Integer.parseInt(params.get("count"));

        int totalCount = -1;
        if (SmeagolConfig.getInstance().get("sparql_supports_count").equalsIgnoreCase("true")) {
            totalCount = getTotalCount(query);
        }

        Sparql sparqlResult = runSparql(query, offset, count);
        IResponse response = buildResponse(sparqlResult, offset, count, totalCount);

        return response;
    }

    
    protected int getTotalCount(String query) throws OperationException {
        int count = -1;
        String sparql = null;

        int idx = query.indexOf("WHERE");
        if (idx < 0) {
            idx = query.indexOf("where");
        }

        if (idx > 0) {
            sparql = query.substring(idx);
            sparql = "SELECT COUNT(*) " + sparql;
        }
        else {
            throw new OperationException("Could not get count: invalid input query");
        }

        idx = sparql.indexOf("ORDER BY");
        if (idx < 0) {
            idx = sparql.indexOf("order by");
        }

        if (idx > 0) {
            sparql = sparql.substring(0, idx);
        }


        Sparql res = runSparql(sparql, 0, 0);
        Iterator<org.w3._2005.sparql_results.Result> rit = res.getResults().getResult().iterator();
        count = 0;
        while (rit.hasNext()) {
            count += Integer.parseInt(rit.next().getBinding().get(0).getLiteral().getContent());
        }

        return count;
    }

    
    protected Sparql runSparql(String query, int offset, int count) throws OperationException {
        String endpoint = SmeagolConfig.getInstance().get("sparql_endpoint");
        String prefix = SmeagolConfig.getInstance().get("sparql_prefix");
        String postfix = SmeagolConfig.getInstance().get("sparql_postfix");
        String sparql = "";

        if (count != 0) {
            query = query + "  LIMIT " + count + " OFFSET " + offset;
        }

        try {
            sparql = java.net.URLEncoder.encode(query, "UTF-8");
        } catch (UnsupportedEncodingException ex) {
            throw new OperationException("Could not encode query: " + ex.getMessage());
        }

        String url = endpoint + prefix + sparql + postfix;
        logger.info("Sparql Request: {}", url);

        String responseBody = makeHTTPGetRequest(url);

        Sparql response = null;
        try {
            StringReader sr = new StringReader(responseBody);
            JAXBContext jc = JAXBContext.newInstance("org.w3._2005.sparql_results");
            response = (Sparql) jc.createUnmarshaller().unmarshal(sr);
        } catch (JAXBException ex) {
            logger.error("{}", ex);
            throw new OperationException("Error processing XML response: " + ex.getMessage());
        }

        return response;
    }

    
    protected IResponse buildResponse(Sparql data, int offset, int count, int totalCount) {
        SparqlResponse response = new SparqlResponse();

        Page page = new Page();
        page.setOffset(offset);
        page.setCount(data.getResults().getResult().size());
        page.setTotal(totalCount);

        Meta meta = new Meta();
        meta.setClientID("");
        meta.setPage(page);

        List<Results> results = new ArrayList<Results>();
        Iterator<org.w3._2005.sparql_results.Result> rit = data.getResults().getResult().iterator();

        while (rit.hasNext()) {
            Iterator<Binding> bindingsIterator = rit.next().getBinding().iterator();
            List<Result> rowResults = new ArrayList<Result>();

            while (bindingsIterator.hasNext()) {
                Binding b = bindingsIterator.next();
                Result result = new Result();
                result.setName(b.getName());

                if (b.getLiteral() != null) {
                    Literal lit = new Literal();
                    lit.setContent(b.getLiteral().getContent());
                    lit.setDatatype(b.getLiteral().getDatatype());
                    lit.setLang(b.getLiteral().getLang());
                    result.setLiteral(lit);
                }
                if (b.getUri() != null) {
                    result.setUri(b.getUri());
                }

                rowResults.add(result);
            }

            Results qrs = new Results();
            qrs.setRowResults(rowResults);
            results.add(qrs);
        }

        SparqlData qrdata = new SparqlData();
        qrdata.setResults(results);

        response.setMeta(meta);
        response.setData(qrdata);
        return response;
    }
}
