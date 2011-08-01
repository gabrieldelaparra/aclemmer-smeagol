package edu.umw.cs.smeagol.operation;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.umw.cs.smeagol.model.*;
import edu.umw.cs.smeagol.config.SmeagolConfig;

public class AbstractDatabaseOperation implements IOperation {
	private final Logger logger = LoggerFactory.getLogger(this.getClass());
	private Connection conn = null;

	public AbstractDatabaseOperation() {
		try {
			Class.forName("com.mysql.jdbc.Driver").newInstance();
		} catch (Exception ex) {
			logger.error("Error registering JDBC driver", ex);
		}
	}

	public IResponse execute(Map<String, String> params) throws OperationException {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	public Connection getConnection() {
		if (conn != null) {
			return conn;
		}

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


	public void logSQLError(String msg, SQLException ex) {
		logger.error(msg + " SQLState=" + ex.getSQLState() + ", VendorError=" + ex.getErrorCode(), ex);
	}
}
