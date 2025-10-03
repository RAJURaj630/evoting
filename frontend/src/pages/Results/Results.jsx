import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Alert } from 'react-bootstrap';

const Results = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/results');
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setError('');
      } else {
        setError('Failed to load results');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="voting-container">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card className="bg-primary text-white">
              <Card.Body className="text-center py-4">
                <h1 className="display-4 mb-3">
                  <i className="fas fa-chart-bar me-3"></i>
                  Election Results
                </h1>
                <p className="lead">{results?.election || '2024 General Election'}</p>
                <div className="row mt-4">
                  <div className="col-md-4">
                    <h4>{results?.totalVotes?.toLocaleString() || '0'}</h4>
                    <small>Total Votes</small>
                  </div>
                  <div className="col-md-4">
                    <h4>{results?.turnout || '0%'}</h4>
                    <small>Turnout</small>
                  </div>
                  <div className="col-md-4">
                    <h4>{results?.leading || 'TBD'}</h4>
                    <small>Leading</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Results */}
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3">
              Live Results
              <small className="text-muted ms-2">
                <i className="fas fa-sync-alt"></i>
                Last updated: {results?.lastUpdated ? new Date(results.lastUpdated).toLocaleTimeString() : 'Now'}
              </small>
            </h3>
          </Col>
        </Row>

        {results?.results && (
          <Row>
            {results.results.map((candidate, index) => (
              <Col key={candidate.candidateId} md={6} className="mb-4">
                <Card className={`h-100 ${index === 0 ? 'border-success' : ''}`}>
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="display-4 me-3">
                        {candidate.symbol || ['🌹', '⭐', '🌿', '🕊️'][index]}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="mb-1">
                          {candidate.name}
                          {index === 0 && (
                            <span className="badge bg-success ms-2">Leading</span>
                          )}
                        </h5>
                        <p className="text-muted mb-0">{candidate.party}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Votes: {candidate.votes?.toLocaleString()}</span>
                        <span className="fw-bold">{candidate.percentage}</span>
                      </div>
                      <ProgressBar
                        variant={index === 0 ? 'success' : 'primary'}
                        now={parseFloat(candidate.percentage)}
                        className="mb-2"
                        style={{ height: '10px' }}
                      />
                    </div>

                    <div className="small text-muted">
                      <i className="fas fa-chart-line me-1"></i>
                      {candidate.percentage} of total votes
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Footer Info */}
        <Row className="mt-5">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="fas fa-info-circle me-2"></i>
              Results are updated in real-time. Final results will be announced after voting closes.
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Results;
