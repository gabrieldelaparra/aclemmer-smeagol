package edu.umw.cs.smeagol.model;

public class StatusResponseData implements IData {
        private int code;
        private String message;
        private String payload;

        public StatusResponseData() {

        }

        public int getCode() {
                return code;
        }

        public void setCode(int code) {
                this.code = code;
        }

        public String getMessage() {
                return message;
        }

        public void setMessage(String message) {
                this.message = message;
        }

        public String getPayload() {
                return payload;
        }

        public void setPayload(String payload) {
                this.payload = payload;
        }
}
