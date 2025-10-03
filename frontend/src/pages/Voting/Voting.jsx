import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

const Voting = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(user?.hasVoted || false);

  useEffect(() => {
    fetchCandidates();
    checkVoteStatus();
  }, []);
  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/candidates');
      const data = await response.json();
      if (data.success) {
        setCandidates(data.data.candidates);
      }
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    // For now, we'll use the user context to check vote status
    setHasVoted(user?.hasVoted || false);
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.warning('Please select a candidate to vote for');
      return;
    }

    setVoting(true);
    try {
      const response = await fetch('http://localhost:5001/api/votes/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateId: selectedCandidate }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Vote cast successfully!');
        setHasVoted(true);
      } else {
        toast.error(data.message || 'Failed to cast vote');
      }
    } catch (error) {
      toast.error('Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (hasVoted) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="success" className="text-center">
              <Alert.Heading>Thank You for Voting!</Alert.Heading>
              <p>You have successfully cast your vote. Your participation in the democratic process is appreciated.</p>
              <hr />
              <p className="mb-0">
                You can view the election results on the results page.
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Cast Your Vote</h3>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>Important:</strong> You can only vote once. Your vote is anonymous and encrypted.
                Please review your selection carefully before submitting.
              </Alert>

              <Row>
                {candidates.map((candidate) => (
                  <Col md={6} lg={4} key={candidate.id} className="mb-4">
                    <Card 
                      className={`h-100 cursor-pointer ${selectedCandidate === candidate.id ? 'border-primary' : ''}`}
                      style={{ 
                        cursor: 'pointer',
                        border: selectedCandidate === candidate.id ? '3px solid #0d6efd' : '1px solid #dee2e6'
                      }}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <Card.Body className="text-center">
                        <div className="candidate-symbol mb-3">
                          <div 
                            className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#f8f9fa',
                              border: '2px solid #dee2e6',
                              fontSize: '2rem'
                            }}
                          >
                            {candidate.symbol}
                          </div>
                        </div>
                        <Card.Title>{candidate.name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {candidate.party}
                        </Card.Subtitle>
                        <Card.Text className="text-truncate">
                          {candidate.description}
                        </Card.Text>
                        {selectedCandidate === candidate.id && (
                          <div className="text-primary">
                            <i className="fas fa-check-circle"></i> Selected
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {candidates.length === 0 && (
                <Alert variant="warning" className="text-center">
                  No candidates available for voting at this time.
                </Alert>
              )}

              <div className="text-center mt-4">
                <Button
                  size="lg"
                  onClick={handleVote}
                  disabled={!selectedCandidate || voting || hasVoted}
                  style={{ minWidth: '200px' }}
                >
                  {voting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Casting Vote...
                    </>
                  ) : (
                    'Cast Vote'
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Voting;