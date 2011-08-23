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
import java.io.Reader;
import java.io.StringReader;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.PreparedStatement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.model.*;
import edu.umw.cs.smeagol.model.querystate.*;


public class SaveStateOp extends AbstractDatabaseOperation {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public IResponse execute(Map<String, String> params) throws OperationException {
        if (!params.containsKey("name")) {
            throw new OperationException("Missing parameter 'name'");
        }
        if (!params.containsKey("owner")) {
            throw new OperationException("Missing parameter 'owner'");
        }
        if (!params.containsKey("state")) {
            throw new OperationException("Missing parameter 'state'");
        }

        int owner = Integer.parseInt(params.get("owner"));
        String name = params.get("name");
        String state = params.get("state");

        StatusResponseData data = new StatusResponseData();
        if (doSave(owner, name, state)) {
                data.setCode(0);
                data.setMessage("Success");
        }
        else {
                data.setCode(1);
                data.setMessage("Error");
        }

        Page page = new Page();
        page.setOffset(0);
        page.setCount(1);
        page.setTotal(1);
        Meta meta = new Meta();
        meta.setService("savestate");
        meta.setClientID("");
        meta.setPage(page);

        //Build the response.
        QueryStateResponse result = new QueryStateResponse();
        result.setMeta(meta);
        result.setData(data);
        return result;
    }


    protected boolean doSave(int owner, String name, String state) {
        boolean success = true;

        Connection conn = getConnection();
        PreparedStatement stmt = null;

        try {
            Reader stateReader = new StringReader(state);

            stmt = conn.prepareStatement("INSERT INTO smeagol_state (owner, name, date_created, state) VALUES (?, ?, NOW(), ?)");
            stmt.setInt(1, owner);
            stmt.setString(2, name);
            stmt.setClob(3, stateReader);
            stmt.executeUpdate();
        }
        catch (SQLException ex){
            success = false;
            logSQLError("Error inserting state.", ex);
        }
        finally {
            if (stmt != null) {
                try {
                    stmt.close();
                } catch (SQLException ex) { }
                stmt = null;
            }

            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException ex) { }
                conn = null;
            }
        }

        return success;
    }

}
