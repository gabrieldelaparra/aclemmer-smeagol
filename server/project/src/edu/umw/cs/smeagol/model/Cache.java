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
package edu.umw.cs.smeagol.model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.config.SmeagolConfig;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public final class Cache {

        private final Logger logger = LoggerFactory.getLogger(this.getClass());
        private static final Cache instance = new Cache();

        private Cache() {
                try {
                        Class.forName("com.mysql.jdbc.Driver").newInstance();
                } catch (Exception ex) {
                        logger.error("Error registering JDBC driver", ex);
                }
        }

        public static Cache getInstance() {
                return instance;
        }

        public String load(String key, int offset, int count) {
                String result = null;
                Connection conn = getConnection();
                PreparedStatement stmt = null;
                ResultSet rs = null;

                try {
                        stmt = conn.prepareStatement("SELECT data FROM smeagol_cache WHERE id = ? AND offset = ? AND count = ?");
                        stmt.setString(1, key);
                        stmt.setInt(2, offset);
                        stmt.setInt(3, count);
                        rs = stmt.executeQuery();

                        if (rs.first()) {
                                BufferedReader r = new BufferedReader(rs.getClob(1).getCharacterStream());

                                char[] cbuf = new char[65536];
                                StringBuilder sb = new StringBuilder();

                                int read_this_time = 0;
                                while (read_this_time != -1) {
                                        read_this_time = r.read(cbuf, 0, cbuf.length);
                                        if (read_this_time != -1) {
                                                sb.append(cbuf, 0, read_this_time);
                                        }
                                }

                                result = sb.toString();
                        }
                } catch (SQLException ex) {
                        logSQLError("Error reading cache.", ex);
                } catch (IOException ex) {
                        logger.error("Error reading resultset", ex);
                } finally {
                        if (stmt != null) {
                                try {
                                        stmt.close();
                                } catch (SQLException ex) {
                                }
                                stmt = null;
                        }

                        if (conn != null) {
                                try {
                                        conn.close();
                                } catch (SQLException ex) {
                                }
                                conn = null;
                        }
                }

                return result;
        }

        public boolean store(String key, int offset, int count, String value) {
                boolean success = true;
                PreparedStatement stmt = null;
                Connection conn = getConnection();

                if (conn == null) {
                        return false;
                }

                try {
                        Reader reader = new StringReader(value);

                        stmt = conn.prepareStatement("INSERT INTO smeagol_cache (id, offset, count, data) VALUES (?, ?, ?, ?)");
                        stmt.setString(1, key);
                        stmt.setInt(2, offset);
                        stmt.setInt(3, count);
                        stmt.setClob(4, reader);
                        stmt.executeUpdate();
                } catch (SQLException ex) {
                        success = false;
                        logSQLError("Error inserting cache.", ex);
                } finally {
                        if (stmt != null) {
                                try {
                                        stmt.close();
                                } catch (SQLException ex) {
                                }
                                stmt = null;
                        }

                        if (conn != null) {
                                try {
                                        conn.close();
                                } catch (SQLException ex) {
                                }
                                conn = null;
                        }
                }

                return success;
        }

        private Connection getConnection() {
                Connection conn = null;

                try {
                        conn = DriverManager.getConnection("jdbc:mysql://"
                                + SmeagolConfig.getInstance().get("db_host")
                                + "/" + SmeagolConfig.getInstance().get("db_name")
                                + "?user=" + SmeagolConfig.getInstance().get("db_user")
                                + "&password=" + SmeagolConfig.getInstance().get("db_password"));
                } catch (SQLException ex) {
                        logSQLError("Error getting JDBC Connection.", ex);
                }

                return conn;
        }

        private void logSQLError(String msg, SQLException ex) {
                logger.error(msg + " SQLState=" + ex.getSQLState() + ", VendorError=" + ex.getErrorCode(), ex);
        }
}
