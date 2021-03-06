'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var manager = require('../manager');
var fixtures = manager.fixtures.sessions;

describe('all(cb)', function() {

	var sessionStore;

	before(function(done) {

		manager.setUp(function(error, store) {

			if (error) {
				return done(error);
			}

			sessionStore = store;
			done();
		});
	});

	after(manager.tearDown);

	describe('when sessions exist', function() {

		beforeEach(manager.populateSessions);

		it('should get all sessions', function(done) {

			sessionStore.all(function(error, sessions) {

				try {
					expect(error).to.equal(null);
					expect(sessions).to.be.an('object');
					expect(_.keys(sessions).length).to.equal(fixtures.length);
					_.each(sessions, function(data, id) {
						expect(data).to.be.an('object');
						expect(id).to.be.a('string');
						var fixture = _.findWhere(fixtures, { session_id: id });
						expect(fixture).to.not.be.undefined;
						expect(JSON.stringify(data)).to.equal(JSON.stringify(fixture.data));
					});
				} catch (error) {
					return done(error);
				}

				done();
			});
		});
	});
});
