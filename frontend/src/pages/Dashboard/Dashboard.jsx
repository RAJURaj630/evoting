import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, candidatesResponse] = await Promise.all([
        fetch('http://localhost:5001/api/stats'),
        fetch('http://localhost:5001/api/candidates')
      ]);

      const statsData = await statsResponse.json();
      const candidatesData = await candidatesResponse.json();

      if (statsData.success) setStats(statsData.data);
      if (candidatesData.success) setCandidates(candidatesData.data.candidates);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-container">
      <Container>
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <Card className="bg-primary text-white">
              <Card.Body className="text-center py-5">
                <h1 className="display-4 mb-3">
                  <i className="fas fa-vote-yea me-3"></i>
                  Welcome to E-Voting System
                </h1>
                <p className="lead">
                  {user ? `Hello ${user.name}, ` : ''}
                  Participate in the 2024 General Election
                </p>
                {user && !user.hasVoted && (
                  <Link to="/vote">
                    <Button variant="light" size="lg" className="mt-3">
                      <i className="fas fa-vote-yea me-2"></i>
                      Cast Your Vote Now
                    </Button>
                  </Link>
                )}
                {user && user.hasVoted && (
                  <Alert variant="success" className="mt-3 mx-auto" style={{ maxWidth: '400px' }}>
                    <i className="fas fa-check-circle me-2"></i>
                    You have already voted. Thank you for participating!
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Statistics */}
        {stats && (
          <Row className="mb-4">
            <Col>
              <h3 className="mb-3">Election Statistics</h3>
            </Col>
          </Row>
        )}

        {stats && (
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-users fa-2x text-primary mb-3"></i>
                  <h4>{stats.totalVoters?.toLocaleString()}</h4>
                  <p className="text-muted mb-0">Total Voters</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-vote-yea fa-2x text-success mb-3"></i>
                  <h4>{stats.voted?.toLocaleString()}</h4>
                  <p className="text-muted mb-0">Votes Cast</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-clock fa-2x text-warning mb-3"></i>
                  <h4>{stats.pending?.toLocaleString()}</h4>
                  <p className="text-muted mb-0">Pending</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body className="text-center">
                  <i className="fas fa-chart-pie fa-2x text-info mb-3"></i>
                  <h4>{stats.turnout}</h4>
                  <p className="text-muted mb-0">Turnout</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Candidates Preview */}
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3">Candidates</h3>
          </Col>
        </Row>

        <Row>
          {candidates.slice(0, 4).map((candidate) => (
            <Col key={candidate.id} md={6} lg={3} className="mb-4">
              <Card className="candidate-card h-100">
                <Card.Body className="text-center">
                  <div className="display-1 mb-3">{candidate.symbol}</div>
                  <Card.Title>{candidate.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{candidate.party}</Card.Subtitle>
                  <Card.Text className="small">{candidate.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Action Buttons */}
        <Row className="mt-4">
          <Col className="text-center">
            <Link to="/vote" className="me-3">
              <Button variant="primary" size="lg">
                <i className="fas fa-vote-yea me-2"></i>
                Vote Now
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline-primary" size="lg">
                <i className="fas fa-chart-bar me-2"></i>
                View Results
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
