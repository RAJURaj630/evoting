import React, { useContext } from 'react';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="voting-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow">
              <Card.Header className="bg-primary text-white text-center py-4">
                <i className="fas fa-user-circle fa-4x mb-3"></i>
                <h3>Voter Profile</h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Name:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.name}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Voter ID:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.voterId}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Email:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.email}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Voting Status:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.hasVoted ? (
                      <Badge bg="success">
                        <i className="fas fa-check-circle me-1"></i>
                        Voted
                      </Badge>
                    ) : (
                      <Badge bg="warning">
                        <i className="fas fa-clock me-1"></i>
                        Not Voted
                      </Badge>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Registration Date:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.registrationDate ? 
                      new Date(user.registrationDate).toLocaleDateString() : 
                      'N/A'
                    }
                  </Col>
                </Row>

                {user.hasVoted && (
                  <Alert variant="success" className="mt-4">
                    <i className="fas fa-check-circle me-2"></i>
                    <strong>Thank you for voting!</strong>
                    <br />
                    Your vote has been recorded securely and will be counted in the final results.
                  </Alert>
                )}

                {!user.hasVoted && (
                  <Alert variant="info" className="mt-4">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Ready to vote?</strong>
                    <br />
                    Visit the voting page to cast your ballot in the 2024 General Election.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
