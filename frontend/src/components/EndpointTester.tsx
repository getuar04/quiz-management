import { useState } from "react";
import axios from "axios";

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  body?: Record<string, unknown>;
}

export default function EndpointTester() {
  const rawApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const baseURL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/health",
      description: "Health check - verify API is running",
    },
    {
      method: "GET",
      path: "/quizzes",
      description: "Get all quizzes",
    },
    {
      method: "GET",
      path: "/quizzes/:id",
      description: "Get a specific quiz by ID",
    },
    {
      method: "POST",
      path: "/quizzes",
      description: "Create a new quiz",
      body: {
        title: "Sample Quiz",
        description: "This is a sample quiz",
        questionCount: 0,
      },
    },
    {
      method: "PATCH",
      path: "/quizzes/:id",
      description: "Update a quiz",
      body: {
        title: "Updated Quiz Title",
        description: "Updated description",
      },
    },
    {
      method: "DELETE",
      path: "/quizzes/:id",
      description: "Delete a quiz",
    },
    {
      method: "GET",
      path: "/questions/quiz/:id",
      description: "Get all questions for a quiz",
    },
    {
      method: "POST",
      path: "/questions/quiz/:id",
      description: "Add a question to a quiz",
      body: {
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        points: 1,
      },
    },
    {
      method: "PATCH",
      path: "/questions/:qid",
      description: "Update a question",
      body: {
        questionText: "Updated question text",
        options: ["Option 1", "Option 2", "Option 3"],
        correctAnswer: "Option 1",
      },
    },
    {
      method: "DELETE",
      path: "/questions/:qid",
      description: "Delete a question",
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(
    endpoints[0],
  );
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(selectedEndpoint.body, null, 2) || "",
  );
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : "");
    setPathParams({});
    setResponse(null);
    setError(null);
  };

  const getReplacedPath = (): string => {
    let path = selectedEndpoint.path;
    Object.entries(pathParams).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
    return path;
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const path = getReplacedPath();
      const fullUrl = `${baseURL}${path}`;

      let body: unknown = undefined;
      if (
        selectedEndpoint.method !== "GET" &&
        selectedEndpoint.method !== "DELETE" &&
        requestBody
      ) {
        body = JSON.parse(requestBody);
      }

      const res = await axios({
        method: selectedEndpoint.method,
        url: fullUrl,
        data: body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      setResponse(res.data);
    } catch (err) {
      const axiosError = err as any;
      setError(
        `${axiosError.response?.status || "Error"}: ${
          typeof axiosError.response?.data === "string"
            ? axiosError.response.data
            : JSON.stringify(axiosError.response?.data || err)
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const requiredParams = selectedEndpoint.path.match(/:(\w+)/g) || [];

  return (
    <div className="endpoint-tester">
      <h1>API Endpoint Tester</h1>
      <p className="subtitle">Test all available API endpoints</p>

      <div className="tester-layout">
        <div className="endpoints-panel">
          <h2>Endpoints</h2>
          <div className="endpoints-list">
            {endpoints.map((ep, idx) => (
              <button
                key={idx}
                className={`endpoint-btn ${ep.method} ${
                  selectedEndpoint === ep ? "active" : ""
                }`}
                onClick={() => handleEndpointSelect(ep)}
                title={ep.description}
              >
                <span className="method">{ep.method}</span>
                <span className="path">{ep.path}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="test-panel">
          <div className="test-section">
            <h2>
              {selectedEndpoint.method} {selectedEndpoint.path}
            </h2>
            <p className="description">{selectedEndpoint.description}</p>

            {requiredParams.length > 0 && (
              <div className="params-section">
                <h3>Path Parameters</h3>
                {requiredParams.map((param) => {
                  const paramName = param.replace(":", "");
                  return (
                    <div key={param} className="param-input">
                      <label htmlFor={paramName}>{paramName}</label>
                      <input
                        id={paramName}
                        type="text"
                        placeholder={`Enter value for ${paramName}`}
                        value={pathParams[paramName] || ""}
                        onChange={(e) =>
                          setPathParams({
                            ...pathParams,
                            [paramName]: e.target.value,
                          })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {(selectedEndpoint.method === "POST" ||
              selectedEndpoint.method === "PATCH") && (
              <div className="body-section">
                <h3>Request Body</h3>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder="Enter JSON body"
                  rows={8}
                />
              </div>
            )}

            <div className="button-group">
              <button
                onClick={handleTest}
                disabled={
                  loading ||
                  requiredParams.some((p) => !pathParams[p.replace(":", "")])
                }
                className="btn-test"
              >
                {loading ? "Testing..." : "Send Request"}
              </button>
            </div>

            {error && (
              <div className="response error">
                <h3>Error</h3>
                <pre>{error}</pre>
              </div>
            )}

            {response !== null && !error && (
              <div className="response success">
                <h3>Response</h3>
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
