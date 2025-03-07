export interface AlloraPredictResponse {
  request_id: string;
  status: boolean;
  data: {
    signature: string;
    token_decimals: number;
    inference_data: {
      network_inference: string;
      network_inference_normalized: string;
      confidence_interval_percentiles: string[];
      confidence_interval_percentiles_normalized: string[];
      confidence_interval_values: string[];
      confidence_interval_values_normalized: string[];
      topic_id: string;
      timestamp: number;
      extra_data: string;
    }
  }

}