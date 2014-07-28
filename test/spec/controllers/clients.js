'use strict';
/* jshint expr: true */
/* global sinon: false */

describe('Controller: ClientsCtrl', function () {

  // load the controller's module
  beforeEach(module('openhimWebui2App'));

  var scope, createController, httpBackend, modalSpy;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $modal) {

    httpBackend = $httpBackend;

    $httpBackend.when('GET', new RegExp('.*/clients')).respond([
      {clientID: 'test1', domain: 'test1.openhim.org', name: 'Test 1', roles: ['test'], passwordAlgorithm: 'sha512', passwordHash: '1234', passwordSalt: '1234'},
      {clientID: 'test2', domain: 'test2.openhim.org', name: 'Test 2', roles: ['test'], passwordAlgorithm: 'sha512', passwordHash: '1234', passwordSalt: '1234'}
    ]);

    modalSpy = sinon.spy($modal, 'open');

    createController = function() {
      scope = $rootScope.$new();
      return $controller('ClientsCtrl', { $scope: scope });
    };

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should attach a list of clients to the scope', function () {
    httpBackend.expectGET(new RegExp('.*/clients'));
    createController();
    httpBackend.flush();
    scope.clients.length.should.equal(2);
  });


  it('should open a modal to confirm deletion of a client', function () {
    createController();
    httpBackend.flush();

    httpBackend.expectGET('views/deleteConfirmModal.html').respond(200, '');
    scope.confirmDelete(scope.clients[0]);
    modalSpy.should.be.calledOnce;
    httpBackend.flush();
  });

  it('should open a modal to add a client', function () {
    createController();
    scope.addClient();
    modalSpy.should.be.calledOnce;
    httpBackend.flush();
  });

  it('should open a modal to edit a client', function () {
    createController();
    scope.editClient();
    modalSpy.should.be.calledOnce;
    httpBackend.flush();
  });
});
