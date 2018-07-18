import React from 'react';
import { connect } from 'react-redux';
import '../App.css';
import Form from './Form';
import NoMatch from './NoMatch';
import Loading from './Loading';
import Modal from 'react-modal';
import { getNote, getNotes, editNote, deleteNote } from '../actions';

class Note extends React.Component {
  state = {
    isEditing: false,
    modalIsOpen: false,
    title: "",
    textBody: ""
  }

  // sets note id to this.id
  get id() {
    return this.props.match.params.id;
  }

  // fetches note from server and passes it to store
  componentDidMount() {
    this.props.getNote(this.id);
  }

  // allows current note to be edited
  toggleEditMode = e => {
    e.preventDefault();
    this.setState({ isEditing: true,
                    title: this.props.note.title,
                    textBody: this.props.note.textBody });
  }

  // adjusts state of title and textBody whenever there is new input
  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  // sends edited note to server, turns off edit mode, resets state with contents of new note
  handleEditSubmit = e => {
    e.preventDefault();
    this.props.editNote({ id: this.id, title: this.state.title, textBody: this.state.textBody });
    this.setState({ isEditing: false,
                    title: this.props.note.title,
                    textBody: this.props.note.textBody });
  }

  // activates delete modal
  openModal = e => {
    e.preventDefault();
    this.setState({ modalIsOpen: true });
  }

  // deactivates delete modal
  closeModal = () => {
    this.setState({ modalIsOpen: false });
  }

  // sends delete request to server, redirects to home page
  handleDelete = e => {
    e.preventDefault();
    this.props.deleteNote(this.id);
    this.props.history.push("/");
  }

  render() {
    // if note is not yet loaded into store, or if requested id does not exist, return NoMatch
    if (!this.props.note || this.props.note._id !== this.id) {
      return (
        <Loading />
      )
    }

    if (this.props.note === "no such note") {
      return (
        <NoMatch missing={"note"}/>
      )
    }

    // if edit mode is toggled, return edit form
    if (this.state.isEditing) {
      return (
        <Form type={"edit"}
              title={this.state.title}
              textBody={this.state.textBody}
              handleFormSubmit={this.handleEditSubmit}
              handleInputChange={this.handleInputChange}
        />
      );
    }

    return (
      <div className="main-container note">
        <Modal isOpen={this.state.modalIsOpen}
               onAfterOpen={this.afterOpenModal}
               onRequestClose={this.closeModal}
               className="modal"
               overlayClassName="overlay"
        >
          <h3>Are you sure you want to delete this?</h3>
          <div className="modal-buttons">
            <button onClick={this.handleDelete}>Delete</button>
            <button onClick={this.closeModal}>No</button>
          </div>
        </Modal>

        <div className="actions-container">
          <h5 onClick={this.toggleEditMode}>edit</h5>
          <h5 onClick={this.openModal}>delete</h5>
        </div>

        {/* trims note title if another student hasn't set a maxLength on their title input */}
        <h2>{this.props.note.title.length > 30 ?
             this.props.note.title.slice(0, 30) + '...' :
             this.props.note.title}</h2>
        <div className="note-body">{this.props.note.textBody}</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    note: state.note,
    error: state.error
  }
}

export default connect(mapStateToProps, { getNote, getNotes, editNote, deleteNote })(Note);
